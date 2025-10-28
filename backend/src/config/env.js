import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const tryLoad = () => {
  // 1) .env en backend/ si existe
  const local = path.resolve(process.cwd(), '.env');
  // 2) .env en raíz del monorepo (../.env) cuando corres con --prefix backend
  const root = path.resolve(process.cwd(), '..', '.env');

  if (fs.existsSync(local)) dotenv.config({ path: local });
  else if (fs.existsSync(root)) dotenv.config({ path: root });
  else dotenv.config(); // fallback
};
tryLoad();

export const env = {
  node: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4444),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME ?? 'uvm_qbank',
    user: process.env.DB_USER ?? 'root',
    pass: process.env.DB_PASS ?? ''   // root sin password
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev_only_change_me',
    expiresIn: process.env.JWT_EXPIRES ?? '2d'
  },
  azure: {
    tenantId: process.env.AZURE_TENANT_ID ?? '',
    clientId: process.env.AZURE_CLIENT_ID ?? '',
    redirectUri: process.env.AZURE_REDIRECT_URI ?? ''
  }
};
