const express = require("express");
const { query, transaction } = require("../utils/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * POST /api/navigation/start
 * Iniciar sessão de navegação
 */
router.post("/start", async (req, res) => {
  try {
    const userId = req.user.id;
    const { routeId } = req.body;

    if (!routeId) {
      return res.status(400).json({
        error: "ID da rota é obrigatório",
      });
    }

    // Verificar se rota existe e pertence ao usuário
    const routeResult = await query(
      "SELECT * FROM routes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [routeId, userId]
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Rota não encontrada",
      });
    }

    const route = routeResult.rows[0];

    // Verificar se não há navegação ativa para esta rota
    const activeNavigation = await query(
      "SELECT id FROM navigation_sessions WHERE route_id = $1 AND status = $2",
      [routeId, "active"]
    );

    if (activeNavigation.rows.length > 0) {
      return res.status(400).json({
        error: "Navegação já está ativa para esta rota",
      });
    }

    // Buscar paradas da rota
    const stopsResult = await query(
      "SELECT * FROM route_stops WHERE route_id = $1 ORDER BY stop_order",
      [routeId]
    );

    const stops = stopsResult.rows;

    if (stops.length === 0) {
      return res.status(400).json({
        error: "Rota deve ter pelo menos uma parada",
      });
    }

    // Calcular distância total estimada
    let totalDistance = route.estimated_distance || 0;
    if (totalDistance === 0) {
      // Cálculo simples se não há estimativa
      totalDistance = stops.length * 5000; // 5km por parada
    }

    const result = await transaction(async (client) => {
      // Criar sessão de navegação
      const navigationResult = await client.query(
        `INSERT INTO navigation_sessions (
          route_id, user_id, status, navigation_mode, start_time,
          total_distance, remaining_distance, estimated_fuel_consumption
        ) VALUES ($1, $2, $3, $4, NOW(), $5, $5, $6)
        RETURNING *`,
        [
          routeId,
          userId,
          "active",
          "active",
          totalDistance,
          totalDistance / 10000, // Estimativa: 1L por 10km
        ]
      );

      const session = navigationResult.rows[0];

      // Atualizar status da rota
      await client.query(
        "UPDATE routes SET status = $1, started_at = NOW() WHERE id = $2",
        ["active", routeId]
      );

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, 'start_navigation', 'NavigationSession', $2, $3)`,
        [userId, session.id, JSON.stringify({ routeId, stopsCount: stops.length })]
      );

      return session;
    });

    res.status(201).json({
      message: "Navegação iniciada com sucesso",
      navigationSession: result,
      route: {
        id: route.id,
        name: route.name,
        status: "active",
      },
      stops,
      summary: {
        totalStops: stops.length,
        estimatedDistance: totalDistance,
        estimatedDuration: route.estimated_duration,
      },
    });
  } catch (error) {
    console.error("Erro ao iniciar navegação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/navigation/:id
 * Atualizar sessão de navegação
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      currentStopIndex,
      currentLatitude,
      currentLongitude,
      activeTime,
      remainingDistance,
    } = req.body;

    // Verificar se sessão existe e pertence ao usuário
    const sessionResult = await query(
      "SELECT * FROM navigation_sessions WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão de navegação não encontrada",
      });
    }

    const session = sessionResult.rows[0];

    if (session.status !== "active") {
      return res.status(400).json({
        error: "Sessão de navegação não está ativa",
      });
    }

    // Preparar campos para atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (currentStopIndex !== undefined) {
      updates.push(`current_stop_index = $${paramIndex}`);
      values.push(currentStopIndex);
      paramIndex++;
    }

    if (currentLatitude !== undefined && currentLongitude !== undefined) {
      updates.push(`current_latitude = $${paramIndex}`);
      values.push(currentLatitude);
      paramIndex++;
      updates.push(`current_longitude = $${paramIndex}`);
      values.push(currentLongitude);
      paramIndex++;
      updates.push(`last_location_update = NOW()`);
    }

    if (activeTime !== undefined) {
      updates.push(`active_time = $${paramIndex}`);
      values.push(activeTime);
      paramIndex++;
    }

    if (remainingDistance !== undefined) {
      updates.push(`remaining_distance = $${paramIndex}`);
      values.push(remainingDistance);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "Nenhum campo para atualizar",
      });
    }

    // Adicionar updated_at
    updates.push(`updated_at = NOW()`);

    // Adicionar WHERE
    values.push(id);

    const updateQuery = `
      UPDATE navigation_sessions 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    res.json({
      message: "Navegação atualizada com sucesso",
      navigationSession: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar navegação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/navigation/:id/pause
 * Pausar navegação
 */
router.post("/:id/pause", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `UPDATE navigation_sessions 
       SET status = 'paused', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'active'
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão de navegação ativa não encontrada",
      });
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'pause_navigation', 'NavigationSession', $2)`,
      [userId, id]
    );

    res.json({
      message: "Navegação pausada com sucesso",
      navigationSession: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao pausar navegação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/navigation/:id/resume
 * Retomar navegação pausada
 */
router.post("/:id/resume", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `UPDATE navigation_sessions 
       SET status = 'active', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'paused'
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão de navegação pausada não encontrada",
      });
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'resume_navigation', 'NavigationSession', $2)`,
      [userId, id]
    );

    res.json({
      message: "Navegação retomada com sucesso",
      navigationSession: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao retomar navegação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/navigation/:id/complete-stop
 * Marcar parada como completa
 */
router.post("/:id/complete-stop", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { stopId, timeSpent, notes } = req.body;

    if (!stopId) {
      return res.status(400).json({
        error: "ID da parada é obrigatório",
      });
    }

    // Verificar se sessão existe e está ativa
    const sessionResult = await query(
      `SELECT ns.*, r.id as route_id 
       FROM navigation_sessions ns
       JOIN routes r ON ns.route_id = r.id
       WHERE ns.id = $1 AND ns.user_id = $2 AND ns.status = 'active'`,
      [id, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão de navegação ativa não encontrada",
      });
    }

    const session = sessionResult.rows[0];

    // Verificar se parada pertence à rota
    const stopResult = await query(
      "SELECT * FROM route_stops WHERE id = $1 AND route_id = $2",
      [stopId, session.route_id]
    );

    if (stopResult.rows.length === 0) {
      return res.status(404).json({
        error: "Parada não encontrada nesta rota",
      });
    }

    const stop = stopResult.rows[0];

    if (stop.is_completed) {
      return res.status(400).json({
        error: "Parada já foi completada",
      });
    }

    const result = await transaction(async (client) => {
      // Marcar parada como completa
      const stopUpdate = await client.query(
        `UPDATE route_stops 
         SET is_completed = true, completed_at = NOW(), time_spent_at_stop = $1, notes = $2
         WHERE id = $3
         RETURNING *`,
        [timeSpent || 0, notes || null, stopId]
      );

      // Verificar se todas as paradas foram completadas
      const remainingStops = await client.query(
        "SELECT COUNT(*) FROM route_stops WHERE route_id = $1 AND is_completed = false",
        [session.route_id]
      );

      const isRouteComplete = parseInt(remainingStops.rows[0].count) === 0;

      // Se rota completa, finalizar navegação
      if (isRouteComplete) {
        await client.query(
          `UPDATE navigation_sessions 
           SET status = 'completed', end_time = NOW()
           WHERE id = $1`,
          [id]
        );

        await client.query(
          "UPDATE routes SET status = 'completed', completed_at = NOW() WHERE id = $1",
          [session.route_id]
        );

        // Criar métricas da rota
        await client.query(
          `INSERT INTO route_metrics (
            route_id, navigation_session_id, total_time, total_distance,
            total_stops, completed_stops, fuel_used
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            session.route_id,
            id,
            session.active_time || 0,
            session.total_distance - session.remaining_distance,
            stop.stop_order, // Assumindo que stop_order é sequencial
            stop.stop_order,
            session.actual_fuel_consumption || 0,
          ]
        );
      }

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, 'complete_stop', 'RouteStop', $2, $3)`,
        [userId, stopId, JSON.stringify({ timeSpent, notes, isRouteComplete })]
      );

      return {
        stop: stopUpdate.rows[0],
        isRouteComplete,
      };
    });

    res.json({
      message: "Parada completada com sucesso",
      stop: result.stop,
      isRouteComplete: result.isRouteComplete,
      ...(result.isRouteComplete && { 
        message: "Rota completada com sucesso! Navegação finalizada." 
      }),
    });
  } catch (error) {
    console.error("Erro ao completar parada:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/navigation/:id/stop
 * Finalizar navegação manualmente
 */
router.post("/:id/stop", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason = "manual" } = req.body;

    const result = await transaction(async (client) => {
      // Buscar sessão
      const sessionResult = await client.query(
        `SELECT ns.*, r.id as route_id 
         FROM navigation_sessions ns
         JOIN routes r ON ns.route_id = r.id
         WHERE ns.id = $1 AND ns.user_id = $2 AND ns.status IN ('active', 'paused')`,
        [id, userId]
      );

      if (sessionResult.rows.length === 0) {
        throw new Error("Sessão de navegação não encontrada");
      }

      const session = sessionResult.rows[0];

      // Finalizar navegação
      const updatedSession = await client.query(
        `UPDATE navigation_sessions 
         SET status = 'completed', end_time = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      // Atualizar rota
      await client.query(
        "UPDATE routes SET status = 'completed', completed_at = NOW() WHERE id = $1",
        [session.route_id]
      );

      // Criar métricas básicas
      await client.query(
        `INSERT INTO route_metrics (
          route_id, navigation_session_id, total_time, total_distance,
          total_stops, completed_stops
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          session.route_id,
          id,
          session.active_time || 0,
          session.total_distance - session.remaining_distance,
          0, // TODO: calcular total de paradas
          0, // TODO: calcular paradas completadas
        ]
      );

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, 'stop_navigation', 'NavigationSession', $2, $3)`,
        [userId, id, JSON.stringify({ reason })]
      );

      return updatedSession.rows[0];
    });

    res.json({
      message: "Navegação finalizada com sucesso",
      navigationSession: result,
    });
  } catch (error) {
    console.error("Erro ao finalizar navegação:", error);
    if (error.message === "Sessão de navegação não encontrada") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/navigation/:id
 * Cancelar navegação
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await transaction(async (client) => {
      // Buscar e cancelar sessão
      const sessionResult = await client.query(
        `UPDATE navigation_sessions 
         SET status = 'cancelled', end_time = NOW()
         WHERE id = $1 AND user_id = $2 AND status IN ('active', 'paused')
         RETURNING *`,
        [id, userId]
      );

      if (sessionResult.rows.length === 0) {
        throw new Error("Sessão de navegação não encontrada");
      }

      const session = sessionResult.rows[0];

      // Atualizar rota para draft
      await client.query(
        "UPDATE routes SET status = 'draft' WHERE id = $1",
        [session.route_id]
      );

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
         VALUES ($1, 'cancel_navigation', 'NavigationSession', $2)`,
        [userId, id]
      );

      return session;
    });

    res.json({
      message: "Navegação cancelada com sucesso",
      navigationSession: result,
    });
  } catch (error) {
    console.error("Erro ao cancelar navegação:", error);
    if (error.message === "Sessão de navegação não encontrada") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/navigation/:id
 * Obter detalhes da sessão de navegação
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar sessão com dados da rota
    const sessionResult = await query(
      `SELECT 
        ns.*,
        r.name as route_name,
        r.description as route_description,
        r.estimated_distance,
        r.estimated_duration
       FROM navigation_sessions ns
       JOIN routes r ON ns.route_id = r.id
       WHERE ns.id = $1 AND ns.user_id = $2`,
      [id, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão de navegação não encontrada",
      });
    }

    const session = sessionResult.rows[0];

    // Buscar paradas da rota
    const stopsResult = await query(
      "SELECT * FROM route_stops WHERE route_id = $1 ORDER BY stop_order",
      [session.route_id]
    );

    res.json({
      navigationSession: session,
      stops: stopsResult.rows,
      summary: {
        completedStops: stopsResult.rows.filter(stop => stop.is_completed).length,
        totalStops: stopsResult.rows.length,
        progress: session.total_distance > 0 
          ? Math.round(((session.total_distance - session.remaining_distance) / session.total_distance) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar navegação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
