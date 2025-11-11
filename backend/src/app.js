import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { env } from './config/env.js';
import router from './routes/index.js';

const app = express();
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());

// Exponer config pública mínima (para frontend)
app.get('/api/config', (_req,res)=> res.json({ microsoftEnabled: false }));

app.use('/api', router);

// Manejo de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  const isProd = process.env.NODE_ENV === 'production';
  res
    .status(err.status || 500)
    .json(isProd ? { message: 'Error inesperado' } : { message: err.message, stack: err.stack });
});

export { app };
