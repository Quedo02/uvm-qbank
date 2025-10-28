import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const auth = (req, res, next) => {
  const raw = req.headers.authorization ?? '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, env.jwt.secret);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
