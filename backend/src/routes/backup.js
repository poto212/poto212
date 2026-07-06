import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { buildMysqlBackup } from '../services/backup.js';

const router = Router();
router.use(authRequired);

router.get('/mysql.sql', async (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo admin puede exportar backups' });
  const dump = await buildMysqlBackup();
  const stamp = new Date().toISOString().replaceAll(':', '-').slice(0, 19);
  return res
    .type('application/sql')
    .setHeader('Content-Disposition', `attachment; filename="sistema-gestion-backup-${stamp}.sql"`)
    .send(dump);
});

export default router;
