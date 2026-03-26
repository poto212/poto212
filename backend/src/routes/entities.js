import { Router } from 'express';
import { readDb, writeDb, nextId } from '../data/db.js';
import { authRequired } from '../middleware/auth.js';
import { can } from '../services/permissions.js';

const router = Router();
const collections = ['clientes', 'proveedores', 'productos', 'egresos', 'users'];

router.use(authRequired);

router.get('/:entity', (req, res) => {
  const { entity } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });
  if (!can(req.user.rol, 'entidades:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const db = readDb();
  return res.json(db[entity]);
});

router.post('/:entity', (req, res) => {
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

  const db = readDb();
  const item = { id: nextId(db[entity]), ...req.body };
  db[entity].push(item);
  writeDb(db);
  return res.status(201).json(item);
});

router.put('/:entity/:id', (req, res) => {
  const { entity, id } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });

  const db = readDb();
  const idx = db[entity].findIndex((i) => Number(i.id) === Number(id));
  if (idx < 0) return res.status(404).json({ error: 'Registro no encontrado' });

  db[entity][idx] = { ...db[entity][idx], ...req.body, id: Number(id) };
  writeDb(db);
  return res.json(db[entity][idx]);
});

router.delete('/:entity/:id', (req, res) => {
  const { entity, id } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });

  const db = readDb();
  db[entity] = db[entity].filter((i) => Number(i.id) !== Number(id));
  writeDb(db);
  return res.status(204).send();
});

export default router;
