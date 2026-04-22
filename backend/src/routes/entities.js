import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { can } from '../services/permissions.js';
import * as storage from '../data/storage.js';

const router = Router();
const collections = ['clientes', 'proveedores', 'productos', 'egresos', 'users'];

router.use(authRequired);

router.get('/:entity', async (req, res) => {
  const { entity } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });
  if (!can(req.user.rol, 'entidades:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  return res.json(await storage.list(entity));
});

router.post('/:entity', async (req, res) => {
  const { entity } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });

  const actionMap = {
    clientes: 'entidades:create',
    proveedores: 'entidades:create',
    productos: 'entidades:create',
    egresos: 'egresos:create',
    users: 'base_datos:manage_users'
  };

  const action = actionMap[entity];
  if (!can(req.user.rol, action) && req.user.rol !== 'admin') return res.status(403).json({ error: `Sin permiso: ${action}` });

  const item = await storage.create(entity, req.body);
  return res.status(201).json(item);
});

router.put('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });
  const updated = await storage.update(entity, id, req.body);
  if (!updated) return res.status(404).json({ error: 'Registro no encontrado' });
  return res.json(updated);
});

router.delete('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });
  await storage.remove(entity, id);
  return res.status(204).send();
});

export default router;
