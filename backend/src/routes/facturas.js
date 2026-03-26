import { Router } from 'express';
import { readDb, writeDb, nextId } from '../data/db.js';
import { authRequired } from '../middleware/auth.js';
import { can } from '../services/permissions.js';

const router = Router();
router.use(authRequired);

function applyIvaRules(condicionIVA, neto, alicuota) {
  if (condicionIVA === 'Responsable Inscripto') {
    const iva = neto * (Number(alicuota || 21) / 100);
    return { tipo: 'Factura A', iva, total: neto + iva };
  }
  if (condicionIVA === 'Monotributista') {
    return { tipo: 'Factura C', iva: 0, total: neto };
  }
  return { tipo: 'Factura B', iva: 0, total: neto };
}

router.post('/simular-cae', (req, res) => {
  if (!can(req.user.rol, 'facturas:create') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const cae = `${Math.floor(10 ** 13 + Math.random() * 9 * 10 ** 13)}`;
  const vence = new Date();
  vence.setDate(vence.getDate() + 10);
  return res.json({ cae, vencimiento: vence.toISOString().slice(0, 10), provider: 'AFIP_DEMO' });
});

router.post('/', (req, res) => {
  if (!can(req.user.rol, 'facturas:create') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });

  const { clienteId, condicionIVA, neto, alicuota, concepto, cae, caeVto } = req.body;
  const db = readDb();
  const cliente = db.clientes.find((c) => Number(c.id) === Number(clienteId));
  if (!cliente) return res.status(400).json({ error: 'Cliente no encontrado' });

  const calculo = applyIvaRules(condicionIVA || cliente.condicionIVA, Number(neto), Number(alicuota || 21));

  const factura = {
    id: nextId(db.facturas),
    fecha: new Date().toISOString().slice(0, 10),
    clienteId: cliente.id,
    cliente: cliente.nombre,
    condicionIVA: condicionIVA || cliente.condicionIVA,
    tipo: calculo.tipo,
    concepto,
    neto: Number(neto),
    iva: calculo.iva,
    total: calculo.total,
    cae: cae || null,
    caeVto: caeVto || null,
    creadoPor: req.user.username
  };

  db.facturas.push(factura);
  writeDb(db);
  return res.status(201).json(factura);
});

router.get('/', (req, res) => {
  if (!can(req.user.rol, 'facturas:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const db = readDb();
  return res.json(db.facturas);
});

router.get('/:id/pdf', (req, res) => {
  if (!can(req.user.rol, 'facturas:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const db = readDb();
  const factura = db.facturas.find((f) => Number(f.id) === Number(req.params.id));
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

  // fase 2 demo: devolver texto plano (hook para reemplazar por PDF real)
  return res
    .type('text/plain')
    .send(`Factura ${factura.tipo}\nCliente: ${factura.cliente}\nTotal: ${factura.total}\nCAE: ${factura.cae || 'N/D'}`);
});

export default router;
