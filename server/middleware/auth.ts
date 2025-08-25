import { Request, Response, NextFunction } from 'express';
import { supabasePublic } from '../lib/supabase';

// Estende o tipo Request para incluir informações do usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
        metadata?: any;
      };
      supabase?: typeof supabasePublic;
    }
  }
}

// Middleware para extrair token do usuário e verificar autenticação
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se o Supabase está configurado
    if (!supabasePublic) {
      req.user = undefined;
      req.supabase = undefined;
      return next();
    }

    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      // Se não há token, continua sem usuário (para rotas públicas)
      req.user = undefined;
      req.supabase = supabasePublic;
      return next();
    }

    // Verificar o token com o Supabase
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    // Anexar informações do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      metadata: user.user_metadata
    };

    // Criar instância do Supabase com token do usuário
    req.supabase = supabasePublic;

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware para rotas que exigem autenticação
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Autenticação obrigatória',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
};

// Middleware para verificar role específica
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Autenticação obrigatória',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ 
        error: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSION'
      });
    }

    next();
  };
};
