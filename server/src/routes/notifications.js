const express = require("express");
const { query, transaction } = require("../utils/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * GET /api/notifications
 * Listar notificações do usuário com filtros
 */
router.get("/", async (req, res) => {
  try {
    const {
      read = "all", // all, true, false
      type = "all", // all, info, warning, success, error, route, system
      limit = 20,
      offset = 0,
      orderBy = "created_at",
      order = "DESC",
    } = req.query;
    const userId = req.user.id;

    let queryText = `
      SELECT 
        n.id, n.type, n.title, n.message, n.details,
        n.read, n.archived, n.actionable, n.action_url, n.action_label,
        n.route_id, n.navigation_session_id, n.icon, n.color, n.priority,
        n.created_at, n.read_at, n.expires_at,
        r.name as route_name
      FROM notifications n
      LEFT JOIN routes r ON n.route_id = r.id
      WHERE n.user_id = $1 AND n.archived = false
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
    `;

    const params = [userId];
    let paramIndex = 2;

    // Filtro por status de leitura
    if (read !== "all") {
      queryText += ` AND n.read = $${paramIndex}`;
      params.push(read === "true");
      paramIndex++;
    }

    // Filtro por tipo
    if (type !== "all") {
      queryText += ` AND n.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    queryText += `
      ORDER BY n.${orderBy} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Contar total para paginação
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM notifications n 
      WHERE n.user_id = $1 AND n.archived = false
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
    `;
    const countParams = [userId];
    let countParamIndex = 2;

    if (read !== "all") {
      countQuery += ` AND n.read = $${countParamIndex}`;
      countParams.push(read === "true");
      countParamIndex++;
    }

    if (type !== "all") {
      countQuery += ` AND n.type = $${countParamIndex}`;
      countParams.push(type);
    }

    const countResult = await query(countQuery, countParams);

    // Contar não lidas
    const unreadResult = await query(
      `SELECT COUNT(*) as unread_count 
       FROM notifications 
       WHERE user_id = $1 AND read = false AND archived = false
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId]
    );

    res.json({
      notifications: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: parseInt(countResult.rows[0].total),
        hasMore:
          parseInt(offset) + parseInt(limit) <
          parseInt(countResult.rows[0].total),
      },
      unreadCount: parseInt(unreadResult.rows[0].unread_count),
    });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/notifications/:id/read
 * Marcar notificação como lida
 */
router.post("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `UPDATE notifications 
       SET read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2 AND read = false
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Notificação não encontrada ou já foi lida",
      });
    }

    res.json({
      message: "Notificação marcada como lida",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Marcar todas as notificações como lidas
 */
router.post("/mark-all-read", async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `UPDATE notifications 
       SET read = true, read_at = NOW()
       WHERE user_id = $1 AND read = false AND archived = false
       RETURNING count(*)`,
      [userId]
    );

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'mark_all_notifications_read', 'Notification', NULL)`,
      [userId]
    );

    res.json({
      message: "Todas as notificações foram marcadas como lidas",
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/notifications/:id/archive
 * Arquivar notificação
 */
router.post("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `UPDATE notifications 
       SET archived = true
       WHERE id = $1 AND user_id = $2 AND archived = false
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Notificação não encontrada ou já foi arquivada",
      });
    }

    res.json({
      message: "Notificação arquivada com sucesso",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao arquivar notificação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/notifications/:id
 * Excluir notificação permanentemente
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Notificação não encontrada",
      });
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'delete_notification', 'Notification', $2)`,
      [userId, id]
    );

    res.json({
      message: "Notificação excluída permanentemente",
    });
  } catch (error) {
    console.error("Erro ao excluir notificação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/notifications/create
 * Criar nova notificação (para testes ou sistema interno)
 */
router.post("/create", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type = "info",
      title,
      message,
      details,
      actionable = false,
      actionUrl,
      actionLabel,
      routeId,
      navigationSessionId,
      icon,
      color,
      priority = "normal",
      expiresAt,
    } = req.body;

    // Validações básicas
    if (!title || !message) {
      return res.status(400).json({
        error: "Título e mensagem são obrigatórios",
      });
    }

    const validTypes = ["info", "warning", "success", "error", "route", "system"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: "Tipo de notificação inválido",
      });
    }

    const validPriorities = ["low", "normal", "high", "urgent"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: "Prioridade inválida",
      });
    }

    const result = await query(
      `INSERT INTO notifications (
        user_id, type, title, message, details, actionable, action_url, 
        action_label, route_id, navigation_session_id, icon, color, 
        priority, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        userId,
        type,
        title.trim(),
        message.trim(),
        details?.trim() || null,
        actionable,
        actionUrl?.trim() || null,
        actionLabel?.trim() || null,
        routeId || null,
        navigationSessionId || null,
        icon || null,
        color || null,
        priority,
        expiresAt || null,
      ]
    );

    res.status(201).json({
      message: "Notificação criada com sucesso",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/notifications/stats
 * Estatísticas das notificações do usuário
 */
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.id;

    const statsResult = await query(
      `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN read = false THEN 1 END) as unread_notifications,
        COUNT(CASE WHEN archived = true THEN 1 END) as archived_notifications,
        COUNT(CASE WHEN type = 'route' THEN 1 END) as route_notifications,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications,
        COUNT(CASE WHEN priority = 'high' OR priority = 'urgent' THEN 1 END) as high_priority_notifications
      FROM notifications 
      WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
    `,
      [userId]
    );

    // Notificações recentes
    const recentResult = await query(
      `
      SELECT type, title, created_at, read
      FROM notifications 
      WHERE user_id = $1 AND archived = false
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 5
    `,
      [userId]
    );

    res.json({
      stats: statsResult.rows[0],
      recent: recentResult.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas de notificações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * Funções auxiliares para criar notificações automáticas
 */

/**
 * Criar notificação de rota iniciada
 */
const createRouteStartedNotification = async (userId, routeId, routeName) => {
  try {
    await query(
      `INSERT INTO notifications (
        user_id, type, title, message, route_id, icon, color, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        "route",
        "Navegação Iniciada",
        `A navegação da rota "${routeName}" foi iniciada com sucesso.`,
        routeId,
        "navigation",
        "#22c55e",
        "normal",
      ]
    );
  } catch (error) {
    console.error("Erro ao criar notificação de rota iniciada:", error);
  }
};

/**
 * Criar notificação de rota completada
 */
const createRouteCompletedNotification = async (userId, routeId, routeName, metrics) => {
  try {
    const details = metrics ? `
      Estatísticas:
      • Tempo total: ${Math.round(metrics.totalTime / 60)} minutos
      • Distância: ${(metrics.totalDistance / 1000).toFixed(1)} km
      • Paradas completadas: ${metrics.completedStops}/${metrics.totalStops}
    ` : null;

    await query(
      `INSERT INTO notifications (
        user_id, type, title, message, details, route_id, 
        icon, color, priority, actionable, action_label
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId,
        "success",
        "Rota Completada",
        `A rota "${routeName}" foi completada com sucesso!`,
        details,
        routeId,
        "check-circle",
        "#22c55e",
        "normal",
        true,
        "Ver Detalhes",
      ]
    );
  } catch (error) {
    console.error("Erro ao criar notificação de rota completada:", error);
  }
};

/**
 * Criar notificação de sistema
 */
const createSystemNotification = async (userId, title, message, priority = "normal") => {
  try {
    await query(
      `INSERT INTO notifications (
        user_id, type, title, message, icon, color, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        "system",
        title,
        message,
        "info",
        "#3b82f6",
        priority,
      ]
    );
  } catch (error) {
    console.error("Erro ao criar notificação de sistema:", error);
  }
};

// Exportar funções auxiliares junto com o router
module.exports = {
  router,
  createRouteStartedNotification,
  createRouteCompletedNotification,
  createSystemNotification,
};
