import { Op } from 'sequelize';
import { User, Role } from '../models/index.js';
import {hash} from '../utils/password.js';

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

export const deleteUsers = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: 'id inválido' });
    }

    const deleted = await User.destroy({ where: { id }, force: true } );

    if (deleted === 0) return res.status(404).json({ message: 'No encontrado' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al borrar' });
  }
};

export const updateUsers = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: 'id inválido' });
    }
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'No encontrado' });
    
    const {name, email, password, role_id} = req.body;

    const payload = {};
    if (name !== undefined) payload.name = String(name).trim();
    if (email !== undefined) payload.email = String(email).trim().toLowerCase();
    if (password !== undefined) {
      const pwd = String(password).trim();
      if (pwd && pwd !== '********') {
        payload.password = await hash(pwd);
      }
    }
    if (role_id !== undefined) payload.role_id = Number(role_id);

    user.set(payload);
    await user.save({ fields: Object.keys(payload) });

    const result = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role_id'],
      include: [{ model: Role, attributes: ['id', 'name'] }]
    });

    return res.json(result);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al actualizar' });
  }
};