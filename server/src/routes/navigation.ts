import express from "express";
import { query, getClient } from "../utils/database";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Aplicar autenticação
router.use(authenticateToken);

/**
 * POST /api/navigation/start
 * Inicia uma sessão de navegação para uma rota
 */
router.post("/start", async (req: AuthRequest, res) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const userId = req.user!.id;
    const { routeId } = req.body;

    if (!routeId) {
      return res.status(400).json({
        error: "ID da rota é obrigatório",
        code: "MISSING_ROUTE_ID",
      });
    }

    // Verificar se rota existe e pertence ao usuário
    const routeResult = await client.query(
      "SELECT * FROM routes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
      [routeId, userId],
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Rota não encontrada",
        code: "ROUTE_NOT_FOUND",
      });
    }

    const route = routeResult.rows[0];

    // Verificar se rota está em status adequado para navegação
    if (route.status === "completed") {
      return res.status(400).json({
        error: "Rota já foi completada",
        code: "ROUTE_COMPLETED",
      });
    }

    // Verificar se não há navegação ativa para esta rota
    const activeNavigation = await client.query(
      "SELECT id FROM navigation_sessions WHERE route_id = $1 AND status = $2",
      [routeId, "active"],
    );

    if (activeNavigation.rows.length > 0) {
      return res.status(400).json({
        error: "Navegação já está ativa para esta rota",
        code: "NAVIGATION_ALREADY_ACTIVE",
      });
    }

    // Buscar paradas da rota
    const stopsResult = await client.query(
      "SELECT * FROM route_stops WHERE route_id = $1 ORDER BY stop_order",
      [routeId],
    );

    const stops = stopsResult.rows;

    if (stops.length === 0) {
      return res.status(400).json({
        error: "Rota não possui paradas",
        code: "NO_STOPS",
      });
    }

    // Calcular distância total estimada (algoritmo simples)
    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const lat1 = stops[i].latitude;
      const lng1 = stops[i].longitude;
      const lat2 = stops[i + 1].latitude;
      const lng2 = stops[i + 1].longitude;

      // Fórmula de Haversine simplificada
      const R = 6371000; // Raio da Terra em metros
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      totalDistance += distance;
    }

    // Criar sessão de navegação
    const navigationResult = await client.query(
      `INSERT INTO navigation_sessions (
        route_id, user_id, status, navigation_mode, start_time,
        total_distance, remaining_distance, estimated_fuel_consumption,
        current_stop_index, estimated_completion_time
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $5, $6, $7, NOW() + INTERVAL '${Math.round(stops.length * 30)} minutes')
      RETURNING *`,
      [
        routeId,
        userId,
        "active",
        "active",
        totalDistance,
        totalDistance / 10000, // Estimativa: 1L por 10km
        0, // Começar na primeira parada
      ],
    );

    const session = navigationResult.rows[0];

    // Atualizar status da rota
    await client.query(
      "UPDATE routes SET status = $1, started_at = NOW() WHERE id = $2",
      ["active", routeId],
    );

    // Log de auditoria
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        "start_navigation",
        "NavigationSession",
        session.id,
        JSON.stringify({
          routeId,
          totalDistance: Math.round(totalDistance),
          stopsCount: stops.length,
        }),
        req.ip,
      ],
    );

    await client.query("COMMIT");

    res.status(201).json({
      navigationSession: session,
      route,
      stops,
      message: "Navegação iniciada com sucesso",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao iniciar navegação:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  } finally {
    client.release();
  }
});

/**
 * PATCH /api/navigation/:id
 * Atualiza uma sessão de navegação (posição atual, status, etc.)
 */
router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const {
      currentLatitude,
      currentLongitude,
      currentStopIndex,
      distanceTraveled,
    } = req.body;

    // Verificar se sessão existe e pertence ao usuário
    const sessionResult = await query(
      "SELECT * FROM navigation_sessions WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão de navegação não encontrada",
        code: "SESSION_NOT_FOUND",
      });
    }

    const session = sessionResult.rows[0];

    if (session.status !== "active") {
      return res.status(400).json({
        error: "Sessão de navegação não está ativa",
        code: "SESSION_NOT_ACTIVE",
      });
    }

    // Atualizar posição atual e dados da navegação
    const updateResult = await query(
      `UPDATE navigation_sessions 
       SET current_latitude = $1, current_longitude = $2, 
           current_stop_index = $3, distance_traveled = $4,
           last_updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        currentLatitude,
        currentLongitude,
        currentStopIndex,
        distanceTraveled,
        id,
      ],
    );

    res.json({
      navigationSession: updateResult.rows[0],
      message: "Posição atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar navegação:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/navigation/:id/complete-stop
 * Marca uma parada como completada
 */
router.post("/:id/complete-stop", async (req: AuthRequest, res) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const userId = req.user!.id;
    const { stopId, notes, arrivalTime, departureTime } = req.body;

    // Verificar sessão
    const sessionResult = await client.query(
      "SELECT * FROM navigation_sessions WHERE id = $1 AND user_id = $2 AND status = $3",
      [id, userId, "active"],
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão de navegação ativa não encontrada",
        code: "SESSION_NOT_FOUND",
      });
    }

    const session = sessionResult.rows[0];

    // Verificar se a parada pertence à rota
    const stopResult = await client.query(
      "SELECT * FROM route_stops WHERE id = $1 AND route_id = $2",
      [stopId, session.route_id],
    );

    if (stopResult.rows.length === 0) {
      return res.status(404).json({
        error: "Parada não encontrada nesta rota",
        code: "STOP_NOT_FOUND",
      });
    }

    const stop = stopResult.rows[0];

    // Marcar parada como completada
    await client.query(
      `UPDATE route_stops 
       SET completed_at = NOW(), completion_notes = $1,
           arrival_time = $2, departure_time = $3
       WHERE id = $4`,
      [
        notes || "",
        arrivalTime || new Date(),
        departureTime || new Date(),
        stopId,
      ],
    );

    // Verificar se todas as paradas foram completadas
    const remainingStopsResult = await client.query(
      "SELECT COUNT(*) as count FROM route_stops WHERE route_id = $1 AND completed_at IS NULL",
      [session.route_id],
    );

    const remainingStops = parseInt(remainingStopsResult.rows[0].count);

    // Se não há mais paradas, finalizar navegação
    if (remainingStops === 0) {
      await client.query(
        `UPDATE navigation_sessions 
         SET status = $1, end_time = NOW(), completion_percentage = 100
         WHERE id = $2`,
        ["completed", id],
      );

      await client.query(
        "UPDATE routes SET status = $1, completed_at = NOW() WHERE id = $2",
        ["completed", session.route_id],
      );
    } else {
      // Atualizar percentual de completude
      const totalStopsResult = await client.query(
        "SELECT COUNT(*) as count FROM route_stops WHERE route_id = $1",
        [session.route_id],
      );

      const totalStops = parseInt(totalStopsResult.rows[0].count);
      const completedStops = totalStops - remainingStops;
      const completionPercentage = Math.round(
        (completedStops / totalStops) * 100,
      );

      await client.query(
        "UPDATE navigation_sessions SET completion_percentage = $1 WHERE id = $2",
        [completionPercentage, id],
      );
    }

    // Log de auditoria
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        "complete_stop",
        "RouteStop",
        stopId,
        JSON.stringify({
          stopName: stop.name,
          navigationSessionId: id,
          notes,
        }),
        req.ip,
      ],
    );

    await client.query("COMMIT");

    res.json({
      message: "Parada completada com sucesso",
      remainingStops,
      navigationCompleted: remainingStops === 0,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao completar parada:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  } finally {
    client.release();
  }
});

/**
 * POST /api/navigation/:id/complete
 * Finaliza uma sessão de navegação
 */
router.post("/:id/complete", async (req: AuthRequest, res) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const userId = req.user!.id;
    const { finalNotes, actualFuelConsumption, endCoordinates } = req.body;

    // Verificar sessão
    const sessionResult = await client.query(
      "SELECT * FROM navigation_sessions WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão de navegação não encontrada",
        code: "SESSION_NOT_FOUND",
      });
    }

    const session = sessionResult.rows[0];

    // Finalizar sessão
    await client.query(
      `UPDATE navigation_sessions 
       SET status = $1, end_time = NOW(), final_notes = $2,
           actual_fuel_consumption = $3, end_latitude = $4, end_longitude = $5,
           completion_percentage = 100
       WHERE id = $6`,
      [
        "completed",
        finalNotes,
        actualFuelConsumption,
        endCoordinates?.lat,
        endCoordinates?.lng,
        id,
      ],
    );

    // Atualizar status da rota
    await client.query(
      "UPDATE routes SET status = $1, completed_at = NOW() WHERE id = $2",
      ["completed", session.route_id],
    );

    // Calcular métricas da navegação
    const duration =
      new Date().getTime() - new Date(session.start_time).getTime();
    const durationMinutes = Math.round(duration / (1000 * 60));

    // Criar registro de métricas
    await client.query(
      `INSERT INTO route_metrics (
        route_id, navigation_session_id, user_id,
        total_duration_minutes, total_distance_meters, fuel_consumption_liters,
        stops_completed, completion_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        session.route_id,
        id,
        userId,
        durationMinutes,
        session.distance_traveled || session.total_distance,
        actualFuelConsumption || session.estimated_fuel_consumption,
        (session.completion_percentage / 100) * 10, // Estimativa de paradas
      ],
    );

    // Log de auditoria
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        "complete_navigation",
        "NavigationSession",
        id,
        JSON.stringify({
          durationMinutes,
          fuelConsumption: actualFuelConsumption,
        }),
        req.ip,
      ],
    );

    await client.query("COMMIT");

    res.json({
      message: "Navegação finalizada com sucesso",
      metrics: {
        duration: durationMinutes,
        distance: session.distance_traveled || session.total_distance,
        fuelConsumption:
          actualFuelConsumption || session.estimated_fuel_consumption,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao finalizar navegação:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/navigation/active
 * Busca navegações ativas do usuário
 */
router.get("/active", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT 
        ns.*, 
        r.name as route_name, 
        r.description as route_description,
        COUNT(rs.id) as total_stops,
        COUNT(CASE WHEN rs.completed_at IS NOT NULL THEN 1 END) as completed_stops
       FROM navigation_sessions ns
       JOIN routes r ON ns.route_id = r.id
       LEFT JOIN route_stops rs ON r.id = rs.route_id
       WHERE ns.user_id = $1 AND ns.status = $2
       GROUP BY ns.id, r.name, r.description
       ORDER BY ns.start_time DESC`,
      [userId, "active"],
    );

    res.json({
      activeSessions: result.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar navegações ativas:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

export default router;
