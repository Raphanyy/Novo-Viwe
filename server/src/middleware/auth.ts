import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json({
      error: "Token de acesso obrigatório",
      code: "MISSING_TOKEN",
    });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Token inválido ou expirado",
      code: "INVALID_TOKEN",
    });
  }
};

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Autenticação obrigatória",
      code: "AUTH_REQUIRED",
    });
  }
  next();
};

// Middleware opcional para verificar se email foi verificado
export const requireEmailVerified = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Autenticação obrigatória",
      code: "AUTH_REQUIRED",
    });
  }

  // TODO: Implementar verificação no banco
  // const user = await getUserById(req.user.id);
  // if (!user.is_email_verified) {
  //   return res.status(403).json({
  //     error: 'Email não verificado',
  //     code: 'EMAIL_NOT_VERIFIED'
  //   });
  // }

  next();
};

// Middleware para verificar plano do usuário
export const requirePlan = (plan: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Autenticação obrigatória",
        code: "AUTH_REQUIRED",
      });
    }

    // TODO: Implementar verificação de plano no banco
    // const user = await getUserById(req.user.id);
    // if (user.plan_type !== plan) {
    //   return res.status(403).json({
    //     error: 'Plano insuficiente',
    //     code: 'INSUFFICIENT_PLAN'
    //   });
    // }

    next();
  };
};
