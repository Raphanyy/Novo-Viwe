const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET não configurado!");
  process.exit(1);
}

/**
 * Gera um access token JWT
 * @param {Object} user - Dados do usuário (id, email, name)
 * @returns {string} JWT token
 */
const generateAccessToken = (user) => {
  if (!user.id || !user.email || !user.name) {
    throw new Error("Dados do usuário incompletos para gerar token");
  }

  const payload = {
    sub: user.id, // subject (user ID)
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000), // issued at
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "viwe-api",
    audience: "viwe-app",
  });
};

/**
 * Gera um refresh token JWT
 * @param {string} userId - ID do usuário
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  if (!userId) {
    throw new Error("User ID é obrigatório para gerar refresh token");
  }

  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    type: "refresh",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: "viwe-api",
    audience: "viwe-app",
  });
};

/**
 * Verifica e decodifica um access token
 * @param {string} token - JWT token
 * @returns {Object} Payload decodificado
 */
const verifyAccessToken = (token) => {
  if (!token) {
    throw new Error("Token não fornecido");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "viwe-api",
      audience: "viwe-app",
    });

    if (decoded.type !== "access") {
      throw new Error("Tipo de token inválido");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expirado");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Token inválido");
    }
    throw error;
  }
};

/**
 * Verifica um refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Payload decodificado
 */
const verifyRefreshToken = (token) => {
  if (!token) {
    throw new Error("Refresh token não fornecido");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "viwe-api",
      audience: "viwe-app",
    });

    if (decoded.type !== "refresh") {
      throw new Error("Tipo de token inválido");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expirado");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Refresh token inválido");
    }
    throw error;
  }
};

/**
 * Extrai token do header Authorization
 * @param {string} authHeader - Header de autorização
 * @returns {string|null} Token extraído
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // Formato esperado: "Bearer token"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Gera tokens de acesso e refresh para um usuário
 * @param {Object} user - Dados do usuário
 * @returns {Object} Tokens gerados
 */
const generateTokenPair = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  // Calcular tempo de expiração
  const accessTokenExp = new Date();
  accessTokenExp.setMinutes(accessTokenExp.getMinutes() + 15); // 15 minutos

  const refreshTokenExp = new Date();
  refreshTokenExp.setDate(refreshTokenExp.getDate() + 30); // 30 dias

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: accessTokenExp.toISOString(),
    refreshTokenExpiresAt: refreshTokenExp.toISOString(),
    tokenType: "Bearer",
  };
};

/**
 * Decodifica um token sem verificar (para debugging)
 * @param {string} token - JWT token
 * @returns {Object} Payload decodificado
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
};

/**
 * Verifica se um token está prestes a expirar
 * @param {string} token - JWT token
 * @param {number} thresholdMinutes - Limite em minutos (padrão: 5)
 * @returns {boolean} True se está prestes a expirar
 */
const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const threshold = thresholdMinutes * 60; // converter para segundos

    return decoded.exp - now <= threshold;
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  generateTokenPair,
  decodeToken,
  isTokenExpiringSoon,
};
