import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import entityRoutes from './routes/entities.js';
import facturasRoutes from './routes/facturas.js';
import informesRoutes from './routes/informes.js';
import backupRoutes from './routes/backup.js';
import { initStorage, getProvider } from './data/storage.js';
import { rateLimit, requestId, securityHeaders } from './middleware/security.js';
import { logError, logRequest } from './services/logger.js';

const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4173,http://127.0.0.1:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function createApp() {
  const app = express();

  app.use(requestId);
  app.use(securityHeaders);
  app.use(cors({ origin: allowedOrigins, credentials: false }));
  app.use(express.json({ limit: '250kb' }));
  app.use(rateLimit);
  app.use(logRequest);

  app.get('/', (_req, res) => {
    res.json({
      name: 'Sistema de Gestion Backend',
      version: '0.2.0',
      provider: getProvider(),
      uptime: process.uptime(),
      capabilities: {
        validation: true,
        securityHeaders: true,
        rateLimit: true,
        pdf: 'application/pdf',
        mail: process.env.SMTP_HOST ? 'smtp' : 'console'
      }
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/entities', entityRoutes);
  app.use('/api/facturas', facturasRoutes);
  app.use('/api/informes', informesRoutes);
  app.use('/api/backup', backupRoutes);

  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada', requestId: req.id }));
  app.use((error, req, res, _next) => {
    logError(error, req);
    res.status(500).json({ error: 'Error interno', requestId: req.id });
  });

  return app;
}

export async function startServer(port = PORT) {
  await initStorage();
  const app = createApp();
  return app.listen(port, () => {
    console.log(`Backend escuchando en http://localhost:${port} (provider: ${getProvider()})`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
