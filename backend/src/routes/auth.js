import { Router } from 'express';
import * as storage from '../data/storage.js';
import { signSession } from '../middleware/auth.js';
import { verifyPassword } from '../services/security.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = await storage.list('users');
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  const user = users.find((u) => u.username === username && u.activo);
  if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = signSession(user);
  return res.json({ token, user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol } });
});

router.get('/health', (_req, res) => res.json({ ok: true, service: 'backend-demo', phase: 'phase-1' }));

export default router;
