const express = require("express");
const { query, transaction } = require("../utils/database");
const { authenticateToken } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * GET /api/user
 * Obter dados completos do usuário atual
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await query(
      `SELECT 
        u.id, u.name, u.email, u.avatar_url, u.phone, u.company,
        u.country, u.city, u.plan_type, u.plan_expires_at,
        u.is_email_verified, u.created_at, u.last_login_at,
        up.theme, up.language, up.push_notifications, up.email_notifications,
        up.traffic_alerts, up.route_updates, up.achievements, up.marketing,
        up.sound_enabled, up.vibration_enabled, up.do_not_disturb_start,
        up.do_not_disturb_end, up.font_size, up.density, up.default_map_mode,
        up.show_traffic_always, up.offline_maps_enabled
       FROM users u
       LEFT JOIN user_preferences up ON u.id = up.user_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = userResult.rows[0];

    // Buscar estatísticas básicas
    const statsResult = await query(
      `SELECT 
        COUNT(r.id) as total_routes,
        COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_routes,
        COALESCE(SUM(rm.total_distance), 0) as total_distance,
        COALESCE(SUM(rm.fuel_saved), 0) as fuel_saved
       FROM routes r
       LEFT JOIN route_metrics rm ON r.id = rm.route_id
       WHERE r.user_id = $1 AND r.deleted_at IS NULL`,
      [userId],
    );

    const stats = statsResult.rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
        phone: user.phone,
        company: user.company,
        country: user.country,
        city: user.city,
        planType: user.plan_type,
        planExpiresAt: user.plan_expires_at,
        isEmailVerified: user.is_email_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,

        preferences: {
          theme: user.theme || "auto",
          language: user.language || "pt-BR",
          pushNotifications: user.push_notifications !== false,
          emailNotifications: user.email_notifications !== false,
          trafficAlerts: user.traffic_alerts !== false,
          routeUpdates: user.route_updates !== false,
          achievements: user.achievements !== false,
          marketing: user.marketing === true,
          soundEnabled: user.sound_enabled !== false,
          vibrationEnabled: user.vibration_enabled !== false,
          doNotDisturbStart: user.do_not_disturb_start,
          doNotDisturbEnd: user.do_not_disturb_end,
          fontSize: user.font_size || 16,
          density: user.density || "normal",
          defaultMapMode: user.default_map_mode || "normal",
          showTrafficAlways: user.show_traffic_always === true,
          offlineMapsEnabled: user.offline_maps_enabled === true,
        },

        stats: {
          totalRoutes: parseInt(stats.total_routes),
          completedRoutes: parseInt(stats.completed_routes),
          totalDistance: parseInt(stats.total_distance),
          fuelSaved: parseFloat(stats.fuel_saved) || 0,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/user
 * Atualizar dados do usuário
 */
router.patch("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, company, country, city, avatarUrl } = req.body;

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

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(phone?.trim() || null);
      paramIndex++;
    }

    if (company !== undefined) {
      updates.push(`company = $${paramIndex}`);
      values.push(company?.trim() || null);
      paramIndex++;
    }

    if (country !== undefined) {
      updates.push(`country = $${paramIndex}`);
      values.push(country?.trim() || null);
      paramIndex++;
    }

    if (city !== undefined) {
      updates.push(`city = $${paramIndex}`);
      values.push(city?.trim() || null);
      paramIndex++;
    }

    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      values.push(avatarUrl?.trim() || null);
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
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING id, name, email, avatar_url, phone, company, country, city, updated_at
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, 'update_user', 'User', $1, $2)`,
      [userId, JSON.stringify(req.body)],
    );

    res.json({
      message: "Usuário atualizado com sucesso",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/user/preferences
 * Atualizar preferências do usuário
 */
router.patch("/preferences", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      theme,
      language,
      pushNotifications,
      emailNotifications,
      trafficAlerts,
      routeUpdates,
      achievements,
      marketing,
      soundEnabled,
      vibrationEnabled,
      doNotDisturbStart,
      doNotDisturbEnd,
      fontSize,
      density,
      defaultMapMode,
      showTrafficAlways,
      offlineMapsEnabled,
    } = req.body;

    // Preparar campos para atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (theme !== undefined) {
      const validThemes = ["auto", "light", "dark"];
      if (!validThemes.includes(theme)) {
        return res.status(400).json({
          error: "Tema deve ser 'auto', 'light' ou 'dark'",
        });
      }
      updates.push(`theme = $${paramIndex}`);
      values.push(theme);
      paramIndex++;
    }

    if (language !== undefined) {
      updates.push(`language = $${paramIndex}`);
      values.push(language);
      paramIndex++;
    }

    if (pushNotifications !== undefined) {
      updates.push(`push_notifications = $${paramIndex}`);
      values.push(pushNotifications);
      paramIndex++;
    }

    if (emailNotifications !== undefined) {
      updates.push(`email_notifications = $${paramIndex}`);
      values.push(emailNotifications);
      paramIndex++;
    }

    if (trafficAlerts !== undefined) {
      updates.push(`traffic_alerts = $${paramIndex}`);
      values.push(trafficAlerts);
      paramIndex++;
    }

    if (routeUpdates !== undefined) {
      updates.push(`route_updates = $${paramIndex}`);
      values.push(routeUpdates);
      paramIndex++;
    }

    if (achievements !== undefined) {
      updates.push(`achievements = $${paramIndex}`);
      values.push(achievements);
      paramIndex++;
    }

    if (marketing !== undefined) {
      updates.push(`marketing = $${paramIndex}`);
      values.push(marketing);
      paramIndex++;
    }

    if (soundEnabled !== undefined) {
      updates.push(`sound_enabled = $${paramIndex}`);
      values.push(soundEnabled);
      paramIndex++;
    }

    if (vibrationEnabled !== undefined) {
      updates.push(`vibration_enabled = $${paramIndex}`);
      values.push(vibrationEnabled);
      paramIndex++;
    }

    if (doNotDisturbStart !== undefined) {
      updates.push(`do_not_disturb_start = $${paramIndex}`);
      values.push(doNotDisturbStart);
      paramIndex++;
    }

    if (doNotDisturbEnd !== undefined) {
      updates.push(`do_not_disturb_end = $${paramIndex}`);
      values.push(doNotDisturbEnd);
      paramIndex++;
    }

    if (fontSize !== undefined) {
      if (fontSize < 12 || fontSize > 20) {
        return res.status(400).json({
          error: "Tamanho da fonte deve estar entre 12 e 20",
        });
      }
      updates.push(`font_size = $${paramIndex}`);
      values.push(fontSize);
      paramIndex++;
    }

    if (density !== undefined) {
      const validDensities = ["compact", "normal", "comfortable"];
      if (!validDensities.includes(density)) {
        return res.status(400).json({
          error: "Densidade deve ser 'compact', 'normal' ou 'comfortable'",
        });
      }
      updates.push(`density = $${paramIndex}`);
      values.push(density);
      paramIndex++;
    }

    if (defaultMapMode !== undefined) {
      const validModes = ["normal", "satellite", "traffic"];
      if (!validModes.includes(defaultMapMode)) {
        return res.status(400).json({
          error: "Modo do mapa deve ser 'normal', 'satellite' ou 'traffic'",
        });
      }
      updates.push(`default_map_mode = $${paramIndex}`);
      values.push(defaultMapMode);
      paramIndex++;
    }

    if (showTrafficAlways !== undefined) {
      updates.push(`show_traffic_always = $${paramIndex}`);
      values.push(showTrafficAlways);
      paramIndex++;
    }

    if (offlineMapsEnabled !== undefined) {
      updates.push(`offline_maps_enabled = $${paramIndex}`);
      values.push(offlineMapsEnabled);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "Nenhuma preferência para atualizar",
      });
    }

    // Adicionar updated_at
    updates.push(`updated_at = NOW()`);

    // Verificar se preferências existem
    const existingPrefs = await query(
      "SELECT id FROM user_preferences WHERE user_id = $1",
      [userId],
    );

    let result;

    if (existingPrefs.rows.length === 0) {
      // Criar preferências se não existirem
      const createFields = ["user_id"];
      const createValues = [userId];
      let createParamIndex = 2;

      updates.forEach((update, index) => {
        if (update !== `updated_at = NOW()`) {
          const field = update.split(" = ")[0];
          createFields.push(field);
          createValues.push(values[index]);
        }
      });

      const createQuery = `
        INSERT INTO user_preferences (${createFields.join(", ")})
        VALUES (${createFields.map((_, i) => `$${i + 1}`).join(", ")})
        RETURNING *
      `;

      result = await query(createQuery, createValues);
    } else {
      // Atualizar preferências existentes
      values.push(userId);

      const updateQuery = `
        UPDATE user_preferences 
        SET ${updates.join(", ")}
        WHERE user_id = $${paramIndex}
        RETURNING *
      `;

      result = await query(updateQuery, values);
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, 'update_preferences', 'UserPreferences', $1, $2)`,
      [userId, JSON.stringify(req.body)],
    );

    res.json({
      message: "Preferências atualizadas com sucesso",
      preferences: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar preferências:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/user/avatar
 * Upload de avatar (por enquanto apenas URL)
 */
router.post("/avatar", async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatarUrl } = req.body;

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return res.status(400).json({
        error: "URL do avatar é obrigatória",
      });
    }

    // Validação básica da URL
    try {
      new URL(avatarUrl);
    } catch {
      return res.status(400).json({
        error: "URL do avatar inválida",
      });
    }

    const result = await query(
      `UPDATE users 
       SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING id, name, email, avatar_url`,
      [avatarUrl, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, 'update_avatar', 'User', $1, $2)`,
      [userId, JSON.stringify({ avatarUrl })],
    );

    res.json({
      message: "Avatar atualizado com sucesso",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar avatar:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/user/change-password
 * Alterar senha do usuário
 */
router.post("/change-password", async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Senha atual e nova senha são obrigatórias",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Nova senha deve ter pelo menos 8 caracteres",
      });
    }

    // Validação de força da senha
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({
        error:
          "Nova senha deve conter ao menos: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial",
      });
    }

    // Buscar usuário e verificar senha atual
    const userResult = await query(
      "SELECT id, password_hash FROM users WHERE id = $1 AND deleted_at IS NULL",
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = userResult.rows[0];

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Senha atual incorreta",
      });
    }

    // Hash da nova senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    const result = await transaction(async (client) => {
      // Atualizar senha
      await client.query(
        "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
        [newPasswordHash, userId],
      );

      // Invalidar todas as sessões ativas (exceto a atual seria ideal, mas por segurança invalidamos todas)
      await client.query(
        "UPDATE auth_sessions SET is_active = FALSE WHERE user_id = $1",
        [userId],
      );

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
         VALUES ($1, 'change_password', 'User', $1)`,
        [userId],
      );

      return true;
    });

    res.json({
      message: "Senha alterada com sucesso. Faça login novamente.",
      sessionInvalidated: true,
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/user
 * Excluir conta do usuário (soft delete)
 */
router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "Senha é obrigatória para confirmar exclusão",
      });
    }

    // Verificar senha
    const userResult = await query(
      "SELECT id, password_hash FROM users WHERE id = $1 AND deleted_at IS NULL",
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = userResult.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Senha incorreta",
      });
    }

    const result = await transaction(async (client) => {
      // Soft delete do usuário
      await client.query(
        "UPDATE users SET deleted_at = NOW(), is_active = FALSE WHERE id = $1",
        [userId],
      );

      // Invalidar todas as sessões
      await client.query(
        "UPDATE auth_sessions SET is_active = FALSE WHERE user_id = $1",
        [userId],
      );

      // Soft delete das rotas
      await client.query(
        "UPDATE routes SET deleted_at = NOW() WHERE user_id = $1",
        [userId],
      );

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, 'delete_user', 'User', $1, $2)`,
        [
          userId,
          JSON.stringify({ reason: reason || "User requested deletion" }),
        ],
      );

      return true;
    });

    res.json({
      message: "Conta excluída com sucesso",
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/user/sessions
 * Listar sessões ativas do usuário
 */
router.get("/sessions", async (req, res) => {
  try {
    const userId = req.user.id;

    const sessionsResult = await query(
      `SELECT 
        id, device_info, user_agent, ip_address, 
        created_at, last_used_at, expires_at, is_active
       FROM auth_sessions 
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY last_used_at DESC`,
      [userId],
    );

    const sessions = sessionsResult.rows.map((session) => ({
      id: session.id,
      deviceInfo: session.device_info,
      userAgent: session.user_agent,
      ipAddress: session.ip_address,
      createdAt: session.created_at,
      lastUsedAt: session.last_used_at,
      expiresAt: session.expires_at,
      isActive: session.is_active,
      isCurrent: false, // TODO: identificar sessão atual
    }));

    res.json({
      sessions,
      total: sessions.length,
      active: sessions.filter((s) => s.isActive).length,
    });
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/user/sessions/:sessionId
 * Revogar sessão específica
 */
router.delete("/sessions/:sessionId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const result = await query(
      `UPDATE auth_sessions 
       SET is_active = FALSE 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [sessionId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Sessão não encontrada",
      });
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'revoke_session', 'AuthSession', $2)`,
      [userId, sessionId],
    );

    res.json({
      message: "Sessão revogada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao revogar sessão:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
