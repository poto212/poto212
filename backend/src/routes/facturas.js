import { Router } from 'express';
import * as storage from '../data/storage.js';
import { authRequired } from '../middleware/auth.js';
import { can } from '../services/permissions.js';
import { buildInvoicePdf } from '../services/pdf.js';
import { validateFactura } from '../services/validation.js';

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

router.post('/', async (req, res) => {
  if (!can(req.user.rol, 'facturas:create') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });

  const parsed = validateFactura(req.body);
  if (!parsed.ok) return res.status(400).json({ error: 'Datos inválidos', fields: parsed.errors });
  const { clienteId, condicionIVA, neto, alicuota, concepto, cae, caeVto } = parsed.data;
  const clientes = await storage.list('clientes');
  const cliente = clientes.find((c) => String(c.id) === String(clienteId));
  if (!cliente) return res.status(400).json({ error: 'Cliente no encontrado' });

  const calculo = applyIvaRules(condicionIVA || cliente.condicionIVA, Number(neto), Number(alicuota || 21));

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
    cae: cae || null,
    caeVto: caeVto || null,
    creadoPor: req.user.username
  };

  const factura = await storage.create('facturas', facturaPayload);
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
