import { Router } from 'express';
import { readDb } from '../data/db.js';
import { signSession } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  const user = db.users.find((u) => u.username === username && u.password === password && u.activo);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = signSession(user);
  return res.json({ token, user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol } });
});

router.get('/health', (_req, res) => res.json({ ok: true, service: 'backend-demo', phase: 'phase-1' }));

export default router;
