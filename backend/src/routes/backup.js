import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { buildMysqlBackup } from '../services/backup.js';
import { restoreMysqlBackup } from '../data/storage.js';

const router = Router();
router.use(authRequired);

function requireAdmin(req, res) {
  if (req.user.rol !== 'admin') {
    res.status(403).json({ error: 'Solo admin puede gestionar backups' });
    return false;
  }
  return true;
}

router.get('/mysql.sql', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const dump = await buildMysqlBackup();
  const stamp = new Date().toISOString().replaceAll(':', '-').slice(0, 19);
  return res
    .type('application/sql')
    .setHeader('Content-Disposition', `attachment; filename="sistema-gestion-backup-${stamp}.sql"`)
    .send(dump);
});

router.post('/mysql/restore', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.body.confirm !== 'RESTAURAR') return res.status(400).json({ error: 'Confirmación requerida: escribí RESTAURAR' });
  const sql = String(req.body.sql || '');
  try {
    const result = await restoreMysqlBackup(sql);
    return res.json({ ok: true, restored: result.statements });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Backup inválido' });
  }
});

export default router;
