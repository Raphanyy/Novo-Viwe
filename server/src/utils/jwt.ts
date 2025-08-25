import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export const generateAccessToken = (user: { id: string; email: string; name: string }): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const generateRefreshToken = (): string => {
  return jwt.sign({}, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

export const generateTokenPair = (user: { id: string; email: string; name: string }): TokenPair => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  
  // Calcular quando o access token expira (15 minutos padrão)
  const expiresAt = new Date();
  const minutes = JWT_EXPIRES_IN.includes('m') ? parseInt(JWT_EXPIRES_IN) : 15;
  expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
  
  return {
    accessToken,
    refreshToken,
    expiresAt
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
};

export const verifyRefreshToken = (token: string): boolean => {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};
