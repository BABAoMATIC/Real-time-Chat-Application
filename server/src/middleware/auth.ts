import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../env';
import { JwtUserPayload } from '../types';

export interface AuthedRequest extends Request {
  user?: JwtUserPayload;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as JwtUserPayload;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
