import { Router } from 'express';
import * as storage from '../data/storage.js';
import { authRequired } from '../middleware/auth.js';
import { can } from '../services/permissions.js';

const router = Router();
router.use(authRequired);

router.get('/resumen', async (req, res) => {
  if (!can(req.user.rol, 'informes:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });

  const facturas = await storage.list('facturas');
  const egresosRows = await storage.list('egresos');
  const ingresos = facturas.reduce((a, f) => a + Number(f.total), 0);
  const egresos = egresosRows.reduce((a, e) => a + Number(e.monto), 0);
  const utilidad = ingresos - egresos;

  return res.json({ ingresos, egresos, utilidad, margen: ingresos ? (utilidad / ingresos) * 100 : 0 });
});

router.get('/egresos-por-categoria', async (req, res) => {
  if (!can(req.user.rol, 'informes:read') && req.user.rol !== 'admin') return res.status(403).json({ error: 'Sin permiso' });
  const egresos = await storage.list('egresos');
  const grouped = egresos.reduce((acc, e) => {
    acc[e.categoria] = (acc[e.categoria] || 0) + Number(e.monto);
    return acc;
  }, {});
  return res.json(grouped);
});

// fase 3 demo: email stub
router.post('/enviar-factura-mail-demo', (req, res) => {
  const { facturaId, to } = req.body;
  return res.json({ ok: true, facturaId, to, status: 'queued_demo', detail: 'Implementar proveedor SMTP/API real en productivo' });
});

export default router;
