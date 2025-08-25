const express = require("express");
const { query, transaction } = require("../utils/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * GET /api/clients
 * Listar clientes do usuário com filtros e paginação
 */
router.get("/", async (req, res) => {
  try {
    const {
      search,
      isActive = "true",
      limit = 20,
      offset = 0,
      orderBy = "created_at",
      order = "DESC",
    } = req.query;
    const userId = req.user.id;

    let queryText = `
      SELECT
        c.id, c.name, c.email, c.phone, c.company,
        c.address, c.city, c.state, c.country,
        c.latitude, c.longitude, c.notes, c.tags,
        c.is_active, c.created_at, c.updated_at, c.last_contact_at,
        COUNT(rs.id) as routes_count
      FROM clients c
      LEFT JOIN route_stops rs ON c.id = rs.client_id
      WHERE c.user_id = $1 AND c.deleted_at IS NULL
    `;

    const params = [userId];
    let paramIndex = 2;

    // Filtro por status ativo
    if (isActive !== "all") {
      queryText += ` AND c.is_active = $${paramIndex}`;
      params.push(isActive === "true");
      paramIndex++;
    }

    // Filtro por busca
    if (search) {
      queryText += ` AND (
        c.name ILIKE $${paramIndex} OR 
        c.email ILIKE $${paramIndex} OR 
        c.phone ILIKE $${paramIndex} OR 
        c.company ILIKE $${paramIndex} OR
        c.address ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += `
      GROUP BY c.id, c.name, c.email, c.phone, c.company,
               c.address, c.city, c.state, c.country,
               c.latitude, c.longitude, c.notes, c.tags,
               c.is_active, c.created_at, c.updated_at, c.last_contact_at
      ORDER BY c.${orderBy} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Contar total para paginação
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM clients c 
      WHERE c.user_id = $1 AND c.deleted_at IS NULL
    `;
    const countParams = [userId];
    let countParamIndex = 2;

    if (isActive !== "all") {
      countQuery += ` AND c.is_active = $${countParamIndex}`;
      countParams.push(isActive === "true");
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (
        c.name ILIKE $${countParamIndex} OR 
        c.email ILIKE $${countParamIndex} OR 
        c.phone ILIKE $${countParamIndex} OR 
        c.company ILIKE $${countParamIndex} OR
        c.address ILIKE $${countParamIndex}
      )`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countQuery, countParams);

    res.json({
      clients: result.rows,
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
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/clients/:id
 * Obter cliente específico com histórico de rotas
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar cliente
    const clientResult = await query(
      `SELECT * FROM clients 
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const client = clientResult.rows[0];

    // Buscar histórico de rotas/paradas
    const routesResult = await query(
      `SELECT 
        r.id as route_id, r.name as route_name, r.status as route_status,
        r.created_at as route_created_at, r.completed_at as route_completed_at,
        rs.id as stop_id, rs.name as stop_name, rs.stop_order,
        rs.is_completed, rs.completed_at as stop_completed_at,
        rs.time_spent_at_stop
       FROM routes r
       JOIN route_stops rs ON r.id = rs.route_id
       WHERE rs.client_id = $1 AND r.deleted_at IS NULL
       ORDER BY r.created_at DESC, rs.stop_order ASC
       LIMIT 50`,
      [id]
    );

    // Buscar estatísticas do cliente
    const statsResult = await query(
      `SELECT 
        COUNT(DISTINCT r.id) as total_routes,
        COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_routes,
        COUNT(rs.id) as total_stops,
        COUNT(CASE WHEN rs.is_completed THEN 1 END) as completed_stops,
        AVG(rs.time_spent_at_stop) as avg_time_per_stop
       FROM routes r
       JOIN route_stops rs ON r.id = rs.route_id
       WHERE rs.client_id = $1 AND r.deleted_at IS NULL`,
      [id]
    );

    const stats = statsResult.rows[0];

    res.json({
      client,
      routes: routesResult.rows,
      stats: {
        totalRoutes: parseInt(stats.total_routes),
        completedRoutes: parseInt(stats.completed_routes),
        totalStops: parseInt(stats.total_stops),
        completedStops: parseInt(stats.completed_stops),
        avgTimePerStop: parseInt(stats.avg_time_per_stop) || 0,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/clients
 * Criar novo cliente
 */
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      company,
      address,
      city,
      state,
      country = "Brasil",
      latitude,
      longitude,
      notes,
      tags,
    } = req.body;

    // Validações básicas
    if (!name || !phone) {
      return res.status(400).json({
        error: "Nome e telefone são obrigatórios",
      });
    }

    // Validar email se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Email inválido",
        });
      }
    }

    // Validar coordenadas se fornecidas
    if (latitude !== undefined && longitude !== undefined) {
      if (
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          error: "Coordenadas inválidas",
        });
      }
    }

    // Verificar se já existe cliente com mesmo nome/telefone
    const existingClient = await query(
      "SELECT id FROM clients WHERE user_id = $1 AND (name = $2 OR phone = $3) AND deleted_at IS NULL",
      [userId, name.trim(), phone.trim()]
    );

    if (existingClient.rows.length > 0) {
      return res.status(409).json({
        error: "Cliente com mesmo nome ou telefone já existe",
      });
    }

    const result = await query(
      `INSERT INTO clients (
        user_id, name, email, phone, company, address, city, state, country,
        latitude, longitude, notes, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        userId,
        name.trim(),
        email?.trim() || null,
        phone.trim(),
        company?.trim() || null,
        address?.trim() || null,
        city?.trim() || null,
        state?.trim() || null,
        country?.trim() || "Brasil",
        latitude || null,
        longitude || null,
        notes?.trim() || null,
        tags || null,
      ]
    );

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, 'create_client', 'Client', $2, $3)`,
      [userId, result.rows[0].id, JSON.stringify({ name, phone, company })]
    );

    res.status(201).json({
      message: "Cliente criado com sucesso",
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/clients/:id
 * Atualizar cliente existente
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      company,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      notes,
      tags,
      isActive,
    } = req.body;

    // Verificar se cliente existe e pertence ao usuário
    const existingClient = await query(
      "SELECT * FROM clients WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId]
    );

    if (existingClient.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Preparar campos para atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          error: "Nome deve ter pelo menos 2 caracteres",
        });
      }
      updates.push(`name = $${paramIndex}`);
      values.push(name.trim());
      paramIndex++;
    }

    if (email !== undefined) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          error: "Email inválido",
        });
      }
      updates.push(`email = $${paramIndex}`);
      values.push(email?.trim() || null);
      paramIndex++;
    }

    if (phone !== undefined) {
      if (!phone) {
        return res.status(400).json({
          error: "Telefone é obrigatório",
        });
      }
      updates.push(`phone = $${paramIndex}`);
      values.push(phone.trim());
      paramIndex++;
    }

    if (company !== undefined) {
      updates.push(`company = $${paramIndex}`);
      values.push(company?.trim() || null);
      paramIndex++;
    }

    if (address !== undefined) {
      updates.push(`address = $${paramIndex}`);
      values.push(address?.trim() || null);
      paramIndex++;
    }

    if (city !== undefined) {
      updates.push(`city = $${paramIndex}`);
      values.push(city?.trim() || null);
      paramIndex++;
    }

    if (state !== undefined) {
      updates.push(`state = $${paramIndex}`);
      values.push(state?.trim() || null);
      paramIndex++;
    }

    if (country !== undefined) {
      updates.push(`country = $${paramIndex}`);
      values.push(country?.trim() || null);
      paramIndex++;
    }

    if (latitude !== undefined && longitude !== undefined) {
      if (
        (latitude !== null && isNaN(latitude)) ||
        (longitude !== null && isNaN(longitude)) ||
        (latitude !== null && (latitude < -90 || latitude > 90)) ||
        (longitude !== null && (longitude < -180 || longitude > 180))
      ) {
        return res.status(400).json({
          error: "Coordenadas inválidas",
        });
      }
      updates.push(`latitude = $${paramIndex}`);
      values.push(latitude);
      paramIndex++;
      updates.push(`longitude = $${paramIndex}`);
      values.push(longitude);
      paramIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(notes?.trim() || null);
      paramIndex++;
    }

    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex}`);
      values.push(tags);
      paramIndex++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    // Adicionar updated_at e last_contact_at
    updates.push(`updated_at = NOW()`);
    updates.push(`last_contact_at = NOW()`);

    // Adicionar WHERE
    values.push(id, userId);

    const updateQuery = `
      UPDATE clients 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, 'update_client', 'Client', $2, $3)`,
      [userId, id, JSON.stringify(req.body)]
    );

    res.json({
      message: "Cliente atualizado com sucesso",
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/clients/:id
 * Excluir cliente (soft delete)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se cliente existe e pertence ao usuário
    const existingClient = await query(
      "SELECT * FROM clients WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId]
    );

    if (existingClient.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Verificar se há rotas ativas associadas
    const activeRoutes = await query(
      `SELECT r.id, r.name 
       FROM routes r
       JOIN route_stops rs ON r.id = rs.route_id
       WHERE rs.client_id = $1 AND r.status IN ('active', 'scheduled') AND r.deleted_at IS NULL`,
      [id]
    );

    if (activeRoutes.rows.length > 0) {
      return res.status(400).json({
        error: "Não é possível excluir cliente com rotas ativas ou agendadas",
        activeRoutes: activeRoutes.rows,
      });
    }

    const result = await transaction(async (client) => {
      // Soft delete do cliente
      const deletedClient = await client.query(
        "UPDATE clients SET deleted_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );

      // Remover cliente das paradas de rotas futuras (manter histórico)
      await client.query(
        "UPDATE route_stops SET client_id = NULL WHERE client_id = $1",
        [id]
      );

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
         VALUES ($1, 'delete_client', 'Client', $2)`,
        [userId, id]
      );

      return deletedClient.rows[0];
    });

    res.json({
      message: "Cliente excluído com sucesso",
      client: {
        id: result.id,
        name: result.name,
        deletedAt: result.deleted_at,
      },
    });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/clients/:id/activate
 * Ativar/desativar cliente
 */
router.post("/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isActive = true } = req.body;

    const result = await query(
      `UPDATE clients 
       SET is_active = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [isActive, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, 'Client', $3, $4)`,
      [
        userId,
        isActive ? "activate_client" : "deactivate_client",
        id,
        JSON.stringify({ isActive }),
      ]
    );

    res.json({
      message: `Cliente ${isActive ? "ativado" : "desativado"} com sucesso`,
      client: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao ativar/desativar cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/clients/stats
 * Estatísticas dos clientes do usuário
 */
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.id;

    const statsResult = await query(
      `
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_clients,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_clients,
        COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as clients_with_email,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as clients_with_location
      FROM clients 
      WHERE user_id = $1 AND deleted_at IS NULL
    `,
      [userId]
    );

    // Top clientes por número de rotas
    const topClientsResult = await query(
      `
      SELECT 
        c.id, c.name, c.company, 
        COUNT(DISTINCT r.id) as routes_count,
        COUNT(rs.id) as stops_count
      FROM clients c
      LEFT JOIN route_stops rs ON c.id = rs.client_id
      LEFT JOIN routes r ON rs.route_id = r.id AND r.deleted_at IS NULL
      WHERE c.user_id = $1 AND c.deleted_at IS NULL
      GROUP BY c.id, c.name, c.company
      HAVING COUNT(DISTINCT r.id) > 0
      ORDER BY routes_count DESC, stops_count DESC
      LIMIT 10
    `,
      [userId]
    );

    // Clientes criados recentemente
    const recentClientsResult = await query(
      `
      SELECT id, name, company, created_at
      FROM clients 
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `,
      [userId]
    );

    res.json({
      stats: statsResult.rows[0],
      topClients: topClientsResult.rows,
      recentClients: recentClientsResult.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar estat��sticas de clientes:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/clients/:id/nearby
 * Buscar clientes próximos a um cliente específico
 */
router.get("/:id/nearby", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { radius = 10 } = req.query; // raio em km

    // Buscar cliente base
    const baseClientResult = await query(
      "SELECT latitude, longitude FROM clients WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [id, userId]
    );

    if (baseClientResult.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const { latitude, longitude } = baseClientResult.rows[0];

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Cliente não possui coordenadas cadastradas",
      });
    }

    // Buscar clientes próximos usando fórmula de distância Haversine
    const nearbyResult = await query(
      `
      SELECT 
        id, name, company, address, city, latitude, longitude,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          )
        ) AS distance
      FROM clients
      WHERE user_id = $3 AND id != $4 AND deleted_at IS NULL
        AND latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING distance <= $5
      ORDER BY distance ASC
      LIMIT 20
    `,
      [latitude, longitude, userId, id, parseFloat(radius)]
    );

    res.json({
      baseClient: { id, latitude, longitude },
      nearbyClients: nearbyResult.rows,
      radius: parseFloat(radius),
      count: nearbyResult.rows.length,
    });
  } catch (error) {
    console.error("Erro ao buscar clientes próximos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
