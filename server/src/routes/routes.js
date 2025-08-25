const express = require("express");
const { query, transaction } = require("../utils/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * GET /api/routes
 * Listar rotas do usuário com filtros e paginação
 */
router.get("/", async (req, res) => {
  try {
    const {
      status,
      limit = 20,
      offset = 0,
      search,
      orderBy = "created_at",
      order = "DESC",
    } = req.query;
    const userId = req.user.id;

    let queryText = `
      SELECT
        r.id, r.name, r.description, r.status, r.priority, r.responsible,
        r.estimated_duration, r.estimated_distance, r.estimated_credits,
        r.created_at, r.updated_at, r.scheduled_date, r.scheduling_type,
        r.route_type, r.is_favorite,
        COUNT(rs.id) as stop_count,
        CASE 
          WHEN r.status = 'completed' THEN rm.total_time
          ELSE NULL 
        END as actual_duration,
        CASE 
          WHEN r.status = 'completed' THEN rm.total_distance
          ELSE NULL 
        END as actual_distance
      FROM routes r
      LEFT JOIN route_stops rs ON r.id = rs.route_id
      LEFT JOIN route_metrics rm ON r.id = rm.route_id
      WHERE r.user_id = $1 AND r.deleted_at IS NULL
    `;

    const params = [userId];
    let paramIndex = 2;

    // Filtro por status
    if (status && status !== "all") {
      queryText += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Filtro por busca
    if (search) {
      queryText += ` AND (r.name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex} OR r.responsible ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += `
      GROUP BY r.id, r.name, r.description, r.status, r.priority, r.responsible,
               r.estimated_duration, r.estimated_distance, r.estimated_credits,
               r.created_at, r.updated_at, r.scheduled_date, r.scheduling_type,
               r.route_type, r.is_favorite, rm.total_time, rm.total_distance
      ORDER BY r.${orderBy} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Contar total para paginação
    const countResult = await query(
      `SELECT COUNT(*) as total 
       FROM routes r 
       WHERE r.user_id = $1 AND r.deleted_at IS NULL
       ${status && status !== "all" ? `AND r.status = '${status}'` : ""}
       ${search ? `AND (r.name ILIKE '%${search}%' OR r.description ILIKE '%${search}%' OR r.responsible ILIKE '%${search}%')` : ""}`,
      [userId],
    );

    res.json({
      routes: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: parseInt(countResult.rows[0].total),
        hasMore:
          parseInt(offset) + parseInt(limit) <
          parseInt(countResult.rows[0].total),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar rotas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/routes/:id
 * Obter rota específica com paradas
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar rota
    const routeResult = await query(
      `SELECT * FROM routes 
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId],
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: "Rota não encontrada" });
    }

    const route = routeResult.rows[0];

    // Buscar paradas
    const stopsResult = await query(
      `SELECT rs.*, c.name as client_name, c.phone as client_phone
       FROM route_stops rs
       LEFT JOIN clients c ON rs.client_id = c.id
       WHERE rs.route_id = $1 
       ORDER BY rs.stop_order`,
      [id],
    );

    // Buscar métricas se houver
    const metricsResult = await query(
      "SELECT * FROM route_metrics WHERE route_id = $1",
      [id],
    );

    res.json({
      route: {
        ...route,
        stops: stopsResult.rows,
        metrics: metricsResult.rows[0] || null,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar rota:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/routes
 * Criar nova rota
 */
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      responsible,
      priority = "media",
      stops,
      clients = [],
      routeSet,
      scheduling = { type: "imediata" },
      routeType = "temporary",
    } = req.body;

    // Validações
    if (!name || !responsible) {
      return res.status(400).json({
        error: "Nome e responsável são obrigatórios",
      });
    }

    if (!stops || stops.length === 0) {
      return res.status(400).json({
        error: "Pelo menos uma parada é obrigatória",
      });
    }

    // Calcular estimativas básicas
    const estimatedDistance = stops.length * 5000; // 5km por parada (estimativa)
    const estimatedDuration = stops.length * 1800; // 30 min por parada
    const estimatedCredits = Math.min(stops.length * 2, 20);

    const result = await transaction(async (client) => {
      // Criar rota
      const routeResult = await client.query(
        `INSERT INTO routes (
          user_id, name, description, responsible, priority,
          estimated_duration, estimated_distance, estimated_credits,
          scheduling_type, scheduled_date, route_type, route_set_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          userId,
          name.trim(),
          description?.trim(),
          responsible.trim(),
          priority,
          estimatedDuration,
          estimatedDistance,
          estimatedCredits,
          scheduling.type,
          scheduling.date || null,
          routeType,
          routeSet || null,
        ],
      );

      const route = routeResult.rows[0];

      // Criar paradas
      const stopsData = [];
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];

        const stopResult = await client.query(
          `INSERT INTO route_stops (
            route_id, name, latitude, longitude, address, stop_order,
            client_id, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            route.id,
            stop.name?.trim() || `Parada ${i + 1}`,
            stop.coordinates[1], // latitude
            stop.coordinates[0], // longitude
            stop.address?.trim(),
            i + 1,
            stop.clientId || null,
            stop.notes?.trim() || null,
          ],
        );

        stopsData.push(stopResult.rows[0]);
      }

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, 'create_route', 'Route', $2, $3)`,
        [
          userId,
          route.id,
          JSON.stringify({
            name,
            stops: stops.length,
            responsible,
          }),
        ],
      );

      return { route, stops: stopsData };
    });

    res.status(201).json({
      message: "Rota criada com sucesso",
      route: result.route,
      stops: result.stops,
    });
  } catch (error) {
    console.error("Erro ao criar rota:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/routes/:id
 * Atualizar rota existente
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      description,
      responsible,
      priority,
      status,
      scheduledDate,
      isFavorite,
    } = req.body;

    // Verificar se rota existe e pertence ao usuário
    const existingRoute = await query(
      "SELECT * FROM routes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId],
    );

    if (existingRoute.rows.length === 0) {
      return res.status(404).json({ error: "Rota não encontrada" });
    }

    // Preparar campos para atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name.trim());
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description?.trim() || null);
      paramIndex++;
    }

    if (responsible !== undefined) {
      updates.push(`responsible = $${paramIndex}`);
      values.push(responsible.trim());
      paramIndex++;
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      values.push(priority);
      paramIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (scheduledDate !== undefined) {
      updates.push(`scheduled_date = $${paramIndex}`);
      values.push(scheduledDate);
      paramIndex++;
    }

    if (isFavorite !== undefined) {
      updates.push(`is_favorite = $${paramIndex}`);
      values.push(isFavorite);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    // Adicionar updated_at
    updates.push(`updated_at = NOW()`);

    // Adicionar WHERE
    values.push(id, userId);

    const updateQuery = `
      UPDATE routes 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, 'update_route', 'Route', $2, $3)`,
      [userId, id, JSON.stringify(req.body)],
    );

    res.json({
      message: "Rota atualizada com sucesso",
      route: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar rota:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/routes/:id
 * Excluir rota (soft delete)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se rota existe e pertence ao usuário
    const existingRoute = await query(
      "SELECT * FROM routes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId],
    );

    if (existingRoute.rows.length === 0) {
      return res.status(404).json({ error: "Rota não encontrada" });
    }

    // Verificar se há navegação ativa
    const activeNavigation = await query(
      "SELECT id FROM navigation_sessions WHERE route_id = $1 AND status = $2",
      [id, "active"],
    );

    if (activeNavigation.rows.length > 0) {
      return res.status(400).json({
        error: "Não é possível excluir rota com navegação ativa",
      });
    }

    // Soft delete
    await query("UPDATE routes SET deleted_at = NOW() WHERE id = $1", [id]);

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'delete_route', 'Route', $2)`,
      [userId, id],
    );

    res.json({ message: "Rota excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir rota:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/routes/stats
 * Estatísticas das rotas do usuário
 */
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.id;

    const statsResult = await query(
      `
      SELECT 
        COUNT(*) as total_routes,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_routes,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_routes,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_routes,
        COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorite_routes,
        COALESCE(SUM(estimated_distance), 0) as total_estimated_distance,
        COALESCE(AVG(estimated_duration), 0) as avg_estimated_duration
      FROM routes 
      WHERE user_id = $1 AND deleted_at IS NULL
    `,
      [userId],
    );

    const recentRoutesResult = await query(
      `
      SELECT id, name, status, created_at
      FROM routes 
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `,
      [userId],
    );

    res.json({
      stats: statsResult.rows[0],
      recentRoutes: recentRoutesResult.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
