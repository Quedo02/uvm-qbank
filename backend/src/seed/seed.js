import { sequelize, Role, User } from '../models/index.js';
import { hash } from '../utils/password.js';

await sequelize.sync();

await Role.bulkCreate([
  { id:1, name:'admin' },
  { id:2, name:'coordinador' },
  { id:3, name:'docente_tc' },
  { id:4, name:'docente_general' },
  { id:5, name:'estudiante' },
], { ignoreDuplicates: true });

// Admin por defecto si no existe
const adminEmail = 'admin@uvm.local';
const exists = await User.findOne({ where: { email: adminEmail } });
if (!exists) {
  await User.create({
    name: 'Admin UVM',
    email: adminEmail,
    password_hash: hash('admin123'),
    role_id: 1
  });
  console.log('Admin creado: admin@uvm.local / admin123');
} else {
  console.log('Admin ya existía');
}

console.log('Seed listo');
process.exit(0);
