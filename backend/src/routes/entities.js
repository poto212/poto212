import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { can } from '../services/permissions.js';
import * as storage from '../data/storage.js';
import { hashPassword } from '../services/security.js';
import { validateEntity } from '../services/validation.js';

const router = Router();
const collections = ['clientes', 'proveedores', 'productos', 'egresos', 'users'];
const actionMap = {
  clientes: 'entidades:create',
  proveedores: 'entidades:create',
  productos: 'entidades:create',
  egresos: 'egresos:create',
  users: 'base_datos:manage_users'
};

function safeList(entity, rows) {
  if (entity !== 'users') return rows;
  return rows.map(({ password, ...user }) => user);
}

router.use(authRequired);

router.post('/productos/stock-barcode', async (req, res) => {
  if (!can(req.user.rol, 'entidades:create') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const codigo = String(req.body.codigo || '').trim();
  const cantidad = Number(req.body.cantidad || 0);
  if (!codigo || !Number.isFinite(cantidad) || cantidad === 0) return res.status(400).json({ error: 'Código y cantidad válida requeridos' });

  const productos = await storage.list('productos');
  const producto = productos.find((p) => String(p.codigo).toLowerCase() === codigo.toLowerCase());
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado para el código de barras' });

  const updated = await storage.update('productos', producto.id, { stock: Number(producto.stock || 0) + cantidad });
  return res.json(updated);
});

router.get('/:entity', async (req, res) => {
  const { entity } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });
  if (!can(req.user.rol, 'entidades:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  if (entity === 'users' && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  return res.json(safeList(entity, await storage.list(entity)));
});

router.post('/:entity', async (req, res) => {
  const { entity } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });

  const action = actionMap[entity];
  if (!can(req.user.rol, action) && req.user.rol !== 'admin') return res.status(403).json({ error: `Sin permiso: ${action}` });

  const parsed = validateEntity(entity, req.body);
  if (!parsed.ok) return res.status(400).json({ error: 'Datos inválidos', fields: parsed.errors });
  if (entity === 'users') parsed.data.password = hashPassword(parsed.data.password);

  const item = await storage.create(entity, parsed.data);
  return res.status(201).json(safeList(entity, [item])[0]);
});

router.put('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });
  const action = entity === 'users' ? 'base_datos:manage_users' : actionMap[entity];
  if (!can(req.user.rol, action) && req.user.rol !== 'admin') return res.status(403).json({ error: `Sin permiso: ${action}` });
  const parsed = validateEntity(entity, req.body, { partial: true });
  if (!parsed.ok) return res.status(400).json({ error: 'Datos inválidos', fields: parsed.errors });
  if (entity === 'users' && parsed.data.password) parsed.data.password = hashPassword(parsed.data.password);
  const updated = await storage.update(entity, id, parsed.data);
  if (!updated) return res.status(404).json({ error: 'Registro no encontrado' });
  return res.json(safeList(entity, [updated])[0]);
});

router.delete('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  if (!collections.includes(entity)) return res.status(404).json({ error: 'Entidad no válida' });
  const action = entity === 'users' ? 'base_datos:manage_users' : actionMap[entity];
  if (!can(req.user.rol, action) && req.user.rol !== 'admin') return res.status(403).json({ error: `Sin permiso: ${action}` });
  await storage.remove(entity, id);
  return res.status(204).send();
});

export default router;
