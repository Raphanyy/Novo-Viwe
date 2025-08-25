import express from "express";
import { query, getClient } from "../utils/database";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * GET /api/routes
 * Lista rotas do usuário com filtros e paginação
 */
router.get("/", async (req: AuthRequest, res) => {
  try {
    const { status, limit = 20, offset = 0, search } = req.query;
    const userId = req.user!.id;

    let queryText = `
      SELECT
        r.id, r.name, r.description, r.status, r.priority,
        r.estimated_duration, r.estimated_distance, r.estimated_credits,
        r.created_at, r.updated_at, r.scheduled_date, r.responsible,
        COUNT(rs.id) as stop_count,
        COUNT(CASE WHEN rs.completed_at IS NOT NULL THEN 1 END) as completed_stops
      FROM routes r
      LEFT JOIN route_stops rs ON r.id = rs.route_id
      WHERE r.user_id = $1 AND r.deleted_at IS NULL
    `;

    const params: any[] = [userId];
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
      GROUP BY r.id, r.name, r.description, r.status, r.priority,
               r.estimated_duration, r.estimated_distance, r.estimated_credits,
               r.created_at, r.updated_at, r.scheduled_date, r.responsible
      ORDER BY 
        CASE r.status 
          WHEN 'active' THEN 1 
          WHEN 'scheduled' THEN 2 
          WHEN 'completed' THEN 3 
          ELSE 4 
        END,
        r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await query(queryText, params);

    // Buscar contagem total para paginação
    const countQuery = await query(
      "SELECT COUNT(*) as total FROM routes WHERE user_id = $1 AND deleted_at IS NULL",
      [userId],
    );

    res.json({
      routes: result.rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: parseInt(countQuery.rows[0].total),
        hasMore:
          parseInt(offset as string) + parseInt(limit as string) <
          parseInt(countQuery.rows[0].total),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar rotas:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/routes
 * Cria uma nova rota
 */
router.post("/", async (req: AuthRequest, res) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const userId = req.user!.id;
    const {
      name,
      description,
      responsible,
      priority = "media",
      stops,
      clients,
      routeSet,
      scheduling,
    } = req.body;

    // Validações
    if (!name || !responsible) {
      return res.status(400).json({
        error: "Nome e responsável são obrigatórios",
        code: "MISSING_FIELDS",
      });
    }

    if (!stops || stops.length === 0) {
      return res.status(400).json({
        error: "Pelo menos uma parada é obrigatória",
        code: "MISSING_STOPS",
      });
    }

    // Validar coordenadas das paradas
    for (const stop of stops) {
      if (!stop.coordinates || stop.coordinates.length !== 2) {
        return res.status(400).json({
          error: "Coordenadas inválidas para parada: " + stop.name,
          code: "INVALID_COORDINATES",
        });
      }
    }

    // Calcular estimativas básicas
    const estimatedDistance = stops.length * 5000; // 5km por parada (estimativa)
    const estimatedDuration = stops.length * 1800; // 30 min por parada
    const estimatedCredits = Math.min(stops.length * 2, 20);

    // Determinar status inicial
    let status = "draft";
    let scheduledDate = null;

    if (scheduling?.type === "imediata") {
      status = "scheduled";
    } else if (scheduling?.type === "agendada" && scheduling?.date) {
      status = "scheduled";
      scheduledDate = scheduling.date;
    }

    // Criar rota
    const routeResult = await client.query(
      `INSERT INTO routes (
        user_id, name, description, responsible, priority,
        estimated_duration, estimated_distance, estimated_credits,
        scheduling_type, scheduled_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        name,
        description,
        responsible,
        priority,
        estimatedDuration,
        estimatedDistance,
        estimatedCredits,
        scheduling?.type || "imediata",
        scheduledDate,
        status,
      ],
    );

    const route = routeResult.rows[0];

    // Criar paradas
    const createdStops = [];
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      const stopResult = await client.query(
        `INSERT INTO route_stops (
          route_id, name, latitude, longitude, address, stop_order, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          route.id,
          stop.name,
          stop.coordinates[1], // latitude
          stop.coordinates[0], // longitude
          stop.address || "",
          i + 1,
          stop.notes || "",
        ],
      );
      createdStops.push(stopResult.rows[0]);
    }

    // Associar clientes (se fornecidos)
    if (clients && clients.length > 0) {
      for (const clientData of clients) {
        await client.query(
          `INSERT INTO client_stops (route_id, client_name, stop_id)
           VALUES ($1, $2, $3)`,
          [route.id, clientData.name, clientData.stopId],
        );
      }
    }

    // Log de auditoria
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        "create_route",
        "Route",
        route.id,
        JSON.stringify({
          name,
          stops: stops.length,
          status,
        }),
        req.ip,
      ],
    );

    await client.query("COMMIT");

    res.status(201).json({
      route: {
        ...route,
        stops: createdStops,
      },
      message: "Rota criada com sucesso",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao criar rota:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/routes/:id
 * Busca uma rota específica com suas paradas
 */
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Buscar rota
    const routeResult = await query(
      "SELECT * FROM routes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId],
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Rota não encontrada",
        code: "ROUTE_NOT_FOUND",
      });
    }

    const route = routeResult.rows[0];

    // Buscar paradas
    const stopsResult = await query(
      "SELECT * FROM route_stops WHERE route_id = $1 ORDER BY stop_order",
      [id],
    );

    res.json({
      route: {
        ...route,
        stops: stopsResult.rows,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar rota:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * PATCH /api/routes/:id
 * Atualiza uma rota
 */
router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    // Verificar se rota existe e pertence ao usuário
    const routeResult = await query(
      "SELECT * FROM routes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId],
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Rota não encontrada",
        code: "ROUTE_NOT_FOUND",
      });
    }

    const currentRoute = routeResult.rows[0];

    // Verificar se rota pode ser editada
    if (currentRoute.status === "active") {
      return res.status(400).json({
        error: "Não é possível editar rota ativa",
        code: "ROUTE_ACTIVE",
      });
    }

    // Construir query de update dinamicamente
    const allowedFields = [
      "name",
      "description",
      "responsible",
      "priority",
      "scheduled_date",
      "status",
    ];
    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "Nenhum campo válido para atualizar",
        code: "NO_VALID_FIELDS",
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, userId);

    const queryText = `
      UPDATE routes 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(queryText, values);

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        "update_route",
        "Route",
        id,
        JSON.stringify(currentRoute),
        JSON.stringify(updateData),
        req.ip,
      ],
    );

    res.json({
      route: result.rows[0],
      message: "Rota atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar rota:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * DELETE /api/routes/:id
 * Remove uma rota (soft delete)
 */
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verificar se rota existe e pertence ao usuário
    const routeResult = await query(
      "SELECT * FROM routes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId],
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Rota não encontrada",
        code: "ROUTE_NOT_FOUND",
      });
    }

    const route = routeResult.rows[0];

    // Verificar se rota pode ser removida
    if (route.status === "active") {
      return res.status(400).json({
        error: "Não é possível remover rota ativa",
        code: "ROUTE_ACTIVE",
      });
    }

    // Soft delete
    await query("UPDATE routes SET deleted_at = NOW() WHERE id = $1", [id]);

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, "delete_route", "Route", id, JSON.stringify(route), req.ip],
    );

    res.json({ message: "Rota removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover rota:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

export default router;
