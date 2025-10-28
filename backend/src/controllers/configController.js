import { env } from '../config/env.js';
export const getConfig = (_req, res) => {
  const enabled = !!(env.azure?.clientId && env.azure?.tenantId && env.azure?.redirectUri);
  res.json({ microsoftEnabled: enabled });
};
