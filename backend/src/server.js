import { app } from './app.js';
import { sequelize } from './models/index.js';
import { env } from './config/env.js';

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(env.port, () => console.log(`API on http://localhost:${env.port}`));
};
start();
