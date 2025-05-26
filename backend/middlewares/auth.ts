import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  id: string;
  role: string;
  [key: string]: any;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

/**
 * Middleware to verify JWT token and attach user to req.user
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined

  // 1) Сначала пытаемся читать Authorization
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }
  // 2) Если нет — из куки (нужен cookie-parser)
  else if (req.cookies?.token) {
    token = req.cookies.token
  }
  // 3) Если и так — разбираем сам заголовок Cookie
  else if (req.headers.cookie) {
    const raw = req.headers.cookie.split(';').map(c => c.trim())
    const pair = raw.find(c => c.startsWith('token='))
    if (pair) token = pair.split('=')[1]
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = payload   // { id, role }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * Middleware to authorize based on user role(s)
 * @param roles - allowed roles
 */
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
