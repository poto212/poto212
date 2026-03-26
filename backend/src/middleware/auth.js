import jwt from 'jsonwebtoken';
import { can } from '../services/permissions.js';

const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret';

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireAction(action) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Sin sesión' });
    if (!can(req.user.rol, action)) return res.status(403).json({ error: `Sin permiso: ${action}` });
    return next();
  };
}

export function signSession(user) {
  return jwt.sign({ id: user.id, username: user.username, rol: user.rol, nombre: user.nombre }, JWT_SECRET, {
    expiresIn: '8h'
  });
}
