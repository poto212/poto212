import { Router } from 'express';
import * as storage from '../data/storage.js';
import { authRequired, signSession } from '../middleware/auth.js';
import { verifyPassword } from '../services/security.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password, tenantId } = req.body;
  const requestedTenant = Number(tenantId || process.env.DEFAULT_TENANT_ID || 1);
  const users = await storage.list('users', { tenantId: requestedTenant, includeTenant: true });
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  const user = users.find((u) => u.username === username && u.activo);
  if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = signSession(user);
  return res.json({ token, user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol, tenantId: user.tenantId || requestedTenant } });
});

router.get('/tenants', async (_req, res) => res.json(await storage.list('tenants')));

router.post('/switch-tenant', authRequired, async (req, res) => {
  const tenantId = Number(req.body.tenantId);
  if (!tenantId) return res.status(400).json({ error: 'tenantId requerido' });
  const tenants = await storage.list('tenants');
  const tenant = tenants.find((item) => Number(item.id) === tenantId && item.activo !== 0 && item.activo !== false);
  if (!tenant) return res.status(404).json({ error: 'Empresa no encontrada o inactiva' });
  const tenantUsers = await storage.list('users', { tenantId, includeTenant: true });
  const matchingUser = tenantUsers.find((item) => item.username === req.user.username && item.activo);
  if (!matchingUser && req.user.rol !== 'admin') return res.status(403).json({ error: 'Usuario sin acceso a la empresa seleccionada' });
  const switchedUser = matchingUser || { ...req.user, tenantId };
  const token = signSession(switchedUser);
  return res.json({ token, user: { id: switchedUser.id, username: switchedUser.username, nombre: switchedUser.nombre, rol: switchedUser.rol, tenantId } });
});

router.get('/health', (_req, res) => res.json({ ok: true, service: 'backend-demo', phase: 'phase-1' }));

export default router;
