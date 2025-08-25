const express = require("express");
const bcrypt = require("bcryptjs");
const { query, transaction } = require("../utils/database");
const { generateTokenPair, verifyRefreshToken } = require("../utils/jwt");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrar novo usuário
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Nome, email e senha são obrigatórios",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Senha deve ter pelo menos 8 caracteres",
      });
    }

    // Verificar se email já existe
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email já está em uso",
      });
    }

    // Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Criar usuário em transação
    const result = await transaction(async (client) => {
      // Inserir usuário
      const userResult = await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [name.trim(), email.toLowerCase(), passwordHash],
      );

      const user = userResult.rows[0];

      // Criar preferências padrão
      await client.query("INSERT INTO user_preferences (user_id) VALUES ($1)", [
        user.id,
      ]);

      return user;
    });

    // Gerar tokens
    const tokens = generateTokenPair(result);

    // Salvar refresh token
    await query(
      `INSERT INTO auth_sessions (user_id, refresh_token, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [
        result.id,
        tokens.refreshToken,
        await bcrypt.hash(tokens.refreshToken, 10),
      ],
    );

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, 'user_register', 'User', $1, $2)`,
      [result.id, JSON.stringify({ email, name })],
    );

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        createdAt: result.created_at,
      },
      tokens,
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/auth/login
 * Fazer login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios",
      });
    }

    // Buscar usuário
    const userResult = await query(
      `SELECT id, name, email, password_hash, is_active, is_email_verified 
       FROM users 
       WHERE email = $1 AND deleted_at IS NULL`,
      [email.toLowerCase()],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Email ou senha inválidos",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: "Conta desativada",
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Email ou senha inválidos",
      });
    }

    // Atualizar último login
    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      user.id,
    ]);

    // Gerar tokens
    const tokens = generateTokenPair(user);

    // Salvar refresh token
    await query(
      `INSERT INTO auth_sessions (
        user_id, refresh_token, refresh_token_hash, expires_at,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', $4, $5)`,
      [
        user.id,
        tokens.refreshToken,
        await bcrypt.hash(tokens.refreshToken, 10),
        req.ip,
        req.get("User-Agent") || "unknown",
      ],
    );

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, 'user_login', 'User', $1, $2)`,
      [user.id, req.ip],
    );

    res.json({
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.is_email_verified,
      },
      tokens,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/auth/refresh
 * Renovar access token usando refresh token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token é obrigatório",
      });
    }

    // Verificar refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        error: "Refresh token inválido ou expirado",
      });
    }

    // Buscar sessão ativa
    const sessionResult = await query(
      `SELECT s.*, u.id, u.name, u.email, u.is_active 
       FROM auth_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.refresh_token = $1 AND s.is_active = true AND s.expires_at > NOW()`,
      [refreshToken],
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        error: "Sessão inválida ou expirada",
      });
    }

    const session = sessionResult.rows[0];

    if (!session.is_active) {
      return res.status(401).json({
        error: "Conta desativada",
      });
    }

    // Gerar novo access token
    const tokens = generateTokenPair({
      id: session.id,
      name: session.name,
      email: session.email,
    });

    // Atualizar última utilização da sessão
    await query("UPDATE auth_sessions SET last_used_at = NOW() WHERE id = $1", [
      session.id,
    ]);

    res.json({
      message: "Token renovado com sucesso",
      tokens: {
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        tokenType: tokens.tokenType,
      },
    });
  } catch (error) {
    console.error("Erro no refresh:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

/**
 * POST /api/auth/logout
 * Fazer logout (invalidar refresh token)
 */
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      // Invalidar todas as sessões do usuário
      await query(
        "UPDATE auth_sessions SET is_active = FALSE WHERE user_id = $1",
        [req.user.id],
      );
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'user_logout', 'User', $1)`,
      [req.user.id],
    );

    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/auth/me
 * Obter dados do usuário atual
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT 
        u.id, u.name, u.email, u.avatar_url, u.phone, u.company,
        u.country, u.city, u.plan_type, u.plan_expires_at,
        u.is_email_verified, u.created_at, u.last_login_at,
        up.theme, up.language, up.push_notifications, up.email_notifications
       FROM users u
       LEFT JOIN user_preferences up ON u.id = up.user_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [req.user.id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = userResult.rows[0];

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
          theme: user.theme,
          language: user.language,
          pushNotifications: user.push_notifications,
          emailNotifications: user.email_notifications,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
});

/**
 * GET /api/auth/test
 * Testar autenticação
 */
router.get("/test", authenticateToken, (req, res) => {
  res.json({
    message: "Autenticação funcionando!",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
