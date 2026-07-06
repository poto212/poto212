import { Router } from 'express';
import * as storage from '../data/storage.js';
import { authRequired } from '../middleware/auth.js';
import { can } from '../services/permissions.js';
import { buildInvoicePdf } from '../services/pdf.js';
import { validateFactura } from '../services/validation.js';
import { buildQrPayload, requestCAE } from '../services/afip.js';

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

router.post('/simular-cae', async (req, res) => {
  if (!can(req.user.rol, 'facturas:create') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  return res.json(await requestCAE({ tipo: req.body.tipo || 'Factura B', total: Number(req.body.total || 0) }));
});

router.post('/', async (req, res) => {
  if (!can(req.user.rol, 'facturas:create') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });

  const parsed = validateFactura(req.body);
  if (!parsed.ok) return res.status(400).json({ error: 'Datos inválidos', fields: parsed.errors });
  const { clienteId, condicionIVA, neto, alicuota, concepto } = parsed.data;
  const clientes = await storage.list('clientes');
  const cliente = clientes.find((c) => String(c.id) === String(clienteId));
  if (!cliente) return res.status(400).json({ error: 'Cliente no encontrado' });

  const calculo = applyIvaRules(condicionIVA || cliente.condicionIVA, Number(neto), Number(alicuota || 21));
  const caeResult = await requestCAE({ tipo: calculo.tipo, total: calculo.total });

  const facturaPayload = {
    fecha: new Date().toISOString().slice(0, 10),
    clienteId: cliente.id,
    cliente: cliente.nombre,
    condicionIVA: condicionIVA || cliente.condicionIVA,
    tipo: calculo.tipo,
    concepto,
    neto: Number(neto),
    iva: calculo.iva,
    total: calculo.total,
    cae: caeResult.cae || null,
    caeVto: caeResult.vencimiento || null,
    creadoPor: req.user.username
  };

  const factura = await storage.create('facturas', facturaPayload);
  const qr = buildQrPayload(factura);
  await storage.update('facturas', factura.id, { qr });
  const items = Array.isArray(req.body.items) && req.body.items.length ? req.body.items : [{ descripcion: concepto, cantidad: 1, precioUnitario: neto, total: neto }];
  for (const item of items) {
    await storage.create('factura_items', {
      facturaId: factura.id,
      productoId: item.productoId || null,
      codigo: item.codigo || null,
      descripcion: item.descripcion || concepto,
      cantidad: Number(item.cantidad || 1),
      precioUnitario: Number(item.precioUnitario || neto),
      total: Number(item.total || Number(item.cantidad || 1) * Number(item.precioUnitario || neto))
    });
  }
  factura.qr = qr;
  return res.status(201).json(factura);
});

router.get('/', async (req, res) => {
  if (!can(req.user.rol, 'facturas:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  return res.json(await storage.list('facturas'));
});

router.get('/:id/pdf', async (req, res) => {
  if (!can(req.user.rol, 'facturas:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const factura = await storage.getById('facturas', req.params.id);
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

  const pdf = buildInvoicePdf(factura);
  return res
    .type('application/pdf')
    .setHeader('Content-Disposition', `attachment; filename="factura-${factura.id}.pdf"`)
    .send(pdf);
});

export default router;
