import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../utils/database";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Validador de email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validador de senha forte
const isStrongPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

/**
 * POST /api/auth/register
 * Registra um novo usuário
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Nome, email e senha são obrigatórios",
        code: "MISSING_FIELDS",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Email inválido",
        code: "INVALID_EMAIL",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo",
        code: "WEAK_PASSWORD",
      });
    }

    // Verificar se email já existe
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Email já está em uso",
        code: "EMAIL_EXISTS",
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário
    const userResult = await query(
      `INSERT INTO users (name, email, password_hash, plan_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, plan_type, created_at`,
      [name.trim(), email.toLowerCase(), passwordHash, "basic"],
    );

    const user = userResult.rows[0];

    // Criar preferências padrão
    await query(`INSERT INTO user_preferences (user_id) VALUES ($1)`, [
      user.id,
    ]);

    // Gerar tokens
    const tokens = generateTokenPair(user);

    // Salvar refresh token no banco
    await query(
      `INSERT INTO auth_sessions (user_id, refresh_token, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [
        user.id,
        tokens.refreshToken,
        await bcrypt.hash(tokens.refreshToken, 10),
      ],
    );

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, new_values)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        "register",
        "User",
        user.id,
        req.ip,
        JSON.stringify({ email: user.email }),
      ],
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan_type: user.plan_type,
      },
      tokens,
      message: "Usuário criado com sucesso",
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/auth/login
 * Autentica um usuário
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios",
        code: "MISSING_CREDENTIALS",
      });
    }

    // Buscar usuário
    const userResult = await query(
      `SELECT id, name, email, password_hash, is_active, is_email_verified, plan_type, plan_expires_at
       FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email.toLowerCase()],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Email ou senha inválidos",
        code: "INVALID_CREDENTIALS",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: "Conta desativada. Entre em contato com o suporte.",
        code: "ACCOUNT_DISABLED",
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Email ou senha inválidos",
        code: "INVALID_CREDENTIALS",
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
      `INSERT INTO auth_sessions (user_id, refresh_token, refresh_token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', $4, $5)`,
      [
        user.id,
        tokens.refreshToken,
        await bcrypt.hash(tokens.refreshToken, 10),
        req.ip,
        req.get("User-Agent"),
      ],
    );

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, "login", "User", user.id, req.ip],
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan_type: user.plan_type,
        is_email_verified: user.is_email_verified,
      },
      tokens,
      message: "Login realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/auth/refresh
 * Renova o token de acesso
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token obrigatório",
        code: "MISSING_REFRESH_TOKEN",
      });
    }

    // Verificar se refresh token é válido
    if (!verifyRefreshToken(refreshToken)) {
      return res.status(403).json({
        error: "Refresh token inválido ou expirado",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Buscar sessão no banco
    const sessionResult = await query(
      `SELECT s.id, s.user_id, u.name, u.email, u.is_active
       FROM auth_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.refresh_token = $1 AND s.expires_at > NOW() AND u.is_active = true`,
      [refreshToken],
    );

    if (sessionResult.rows.length === 0) {
      return res.status(403).json({
        error: "Sessão não encontrada ou expirada",
        code: "SESSION_NOT_FOUND",
      });
    }

    const session = sessionResult.rows[0];

    // Gerar novo access token
    const tokens = generateTokenPair({
      id: session.user_id,
      name: session.name,
      email: session.email,
    });

    // Atualizar última utilização da sessão
    await query("UPDATE auth_sessions SET last_used_at = NOW() WHERE id = $1", [
      session.id,
    ]);

    res.json({
      tokens: {
        accessToken: tokens.accessToken,
        expiresAt: tokens.expiresAt,
      },
    });
  } catch (error) {
    console.error("Erro no refresh:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/auth/logout
 * Faz logout do usuário
 */
router.post("/logout", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user!.id;

    if (refreshToken) {
      // Remover sessão específica
      await query(
        "DELETE FROM auth_sessions WHERE user_id = $1 AND refresh_token = $2",
        [userId, refreshToken],
      );
    } else {
      // Remover todas as sessões do usuário
      await query("DELETE FROM auth_sessions WHERE user_id = $1", [userId]);
    }

    // Log de auditoria
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "logout", "User", userId, req.ip],
    );

    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário atual
 */
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const userResult = await query(
      `SELECT id, name, email, avatar_url, phone, company, country, city, 
              plan_type, plan_expires_at, is_email_verified, created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "Usuário não encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    const user = userResult.rows[0];

    res.json({ user });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
});

export default router;
