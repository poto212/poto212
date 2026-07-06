import { Router } from 'express';
import * as storage from '../data/storage.js';
import { authRequired } from '../middleware/auth.js';
import { can } from '../services/permissions.js';
import { sendInvoiceMail } from '../services/mailer.js';
import { validateMailPayload } from '../services/validation.js';

const router = Router();
router.use(authRequired);

router.get('/resumen', async (req, res) => {
  if (!can(req.user.rol, 'informes:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });

  const facturas = await storage.list('facturas', { tenantId: req.tenantId });
  const egresosRows = await storage.list('egresos', { tenantId: req.tenantId });
  const ingresos = facturas.reduce((a, f) => a + Number(f.total), 0);
  const egresos = egresosRows.reduce((a, e) => a + Number(e.monto), 0);
  const utilidad = ingresos - egresos;

  return res.json({ ingresos, egresos, utilidad, margen: ingresos ? (utilidad / ingresos) * 100 : 0 });
});

router.get('/egresos-por-categoria', async (req, res) => {
  if (!can(req.user.rol, 'informes:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const egresos = await storage.list('egresos', { tenantId: req.tenantId });
  const grouped = egresos.reduce((acc, e) => {
    acc[e.categoria] = (acc[e.categoria] || 0) + Number(e.monto);
    return acc;
  }, {});
  return res.json(grouped);
});

router.get('/stock-alertas', async (req, res) => {
  if (!can(req.user.rol, 'informes:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const minimo = Number(req.query.minimo || process.env.STOCK_MINIMO_ALERTA || 5);
  const productos = await storage.list('productos', { tenantId: req.tenantId });
  return res.json(productos.filter((p) => Number(p.stock || 0) <= minimo));
});

router.get('/caja', async (req, res) => {
  if (!can(req.user.rol, 'informes:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const [cobranzas, pagos] = await Promise.all([storage.list('cobranzas', { tenantId: req.tenantId }), storage.list('pagos', { tenantId: req.tenantId })]);
  const totalCobranzas = cobranzas.reduce((acc, row) => acc + Number(row.monto || 0), 0);
  const totalPagos = pagos.reduce((acc, row) => acc + Number(row.monto || 0), 0);
  return res.json({ cobranzas: totalCobranzas, pagos: totalPagos, saldo: totalCobranzas - totalPagos });
});

router.post('/enviar-factura-mail-demo', async (req, res) => {
  if (!can(req.user.rol, 'facturas:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const parsed = validateMailPayload(req.body);
  if (!parsed.ok) return res.status(400).json({ error: 'Datos inválidos', fields: parsed.errors });
  const factura = await storage.getById('facturas', parsed.data.facturaId, { tenantId: req.tenantId });
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  const result = await sendInvoiceMail({ factura, to: parsed.data.to });
  return res.json({ ...result, facturaId: parsed.data.facturaId, to: parsed.data.to });
});

export default router;
