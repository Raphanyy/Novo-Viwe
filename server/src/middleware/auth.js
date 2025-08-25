const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');

/**
 * Middleware para extrair e validar JWT token
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso obrigatório',
        code: 'TOKEN_REQUIRED'
      });
    }

    // Verificar e decodificar token
    const payload = verifyAccessToken(token);
    
    // Adicionar dados do usuário na requisição
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error.message);
    
    if (error.message === 'Token expirado') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Token inválido') {
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }
    
    return res.status(401).json({ 
      error: 'Falha na autenticação',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Middleware para verificar se usuário está autenticado
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Autenticação obrigatória',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
};

/**
 * Middleware para verificar se email está verificado
 */
const requireEmailVerified = (req, res, next) => {
  // TODO: Implementar verificação de email
  // Por enquanto, permitir todos os usuários
  next();
};

/**
 * Middleware para verificar plano do usuário
 */
const requirePlan = (planType) => {
  return (req, res, next) => {
    // TODO: Implementar verificação de plano
    // Por enquanto, permitir todos os planos
    next();
  };
};

/**
 * Middleware opcional de autenticação (não falha se token não existir)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name
      };
    }
    
    next();
  } catch (error) {
    // Em caso de erro, continuar sem usuário
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAuth,
  requireEmailVerified,
  requirePlan,
  optionalAuth
};
