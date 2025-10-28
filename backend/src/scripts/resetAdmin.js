import { sequelize, User } from '../models/index.js';
import { hash } from '../utils/password.js';

const EMAIL = 'admin@uvm.local';
const PASS  = 'admin123';

await sequelize.authenticate();
await sequelize.sync();

let u = await User.findOne({ where: { email: EMAIL } });
if (!u) {
  u = await User.create({ name: 'Admin UVM', email: EMAIL, password_hash: hash(PASS), role_id: 1 });
  console.log('Admin creado:', EMAIL, '/', PASS);
} else {
  u.password_hash = hash(PASS);
  u.role_id = 1;
  await u.save();
  console.log('Admin actualizado (password reseteado):', EMAIL, '/', PASS);
}
process.exit(0);
