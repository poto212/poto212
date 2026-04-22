import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import entityRoutes from './routes/entities.js';
import facturasRoutes from './routes/facturas.js';
import informesRoutes from './routes/informes.js';
import { initStorage, getProvider } from './data/storage.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'Sistema de Gestion Backend Demo',
    version: '0.1.0',
    phases: {
      phase1: 'auth + usuarios + roles + CRUD base',
      phase2: 'facturacion + iva + cae demo + pdf stub',
      phase3: 'informes + envio mail demo'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/informes', informesRoutes);

initStorage().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend demo escuchando en http://localhost:${PORT} (provider: ${getProvider()})`);
  });
});
