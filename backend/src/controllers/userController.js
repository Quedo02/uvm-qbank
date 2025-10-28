import { Op } from 'sequelize';
import { User, Role } from '../models/index.js';

export const listUsers = async (req, res) => {
  const { role_id, roles, q } = req.query;
  const where = {};
  if (role_id) where.role_id = Number(role_id);
  else if (roles) {
    const arr = String(roles).split(',').map(x => Number(x.trim())).filter(Boolean);
    if (arr.length) where.role_id = { [Op.in]: arr };
  }
  if (q) where.name = { [Op.like]: `%${q}%` };

  const rows = await User.findAll({
    where,
    include: [{ model: Role, attributes: ['id','name'] }],
    attributes: ['id','name','email','role_id'],
    order: [['name','ASC']]
  });
  res.json(rows);
};
