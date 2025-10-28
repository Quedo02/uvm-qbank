import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, Role } from '../models/index.js';
import { compare, hash } from '../utils/password.js';

const sign = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role_id: user.role_id },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

export const register = async (req, res) => {
  let { name, email, password, role_id } = req.body;
  email = String(email || '').trim().toLowerCase();

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email ya existe' });

  const u = await User.create({ name, email, password_hash: hash(password), role_id });
  return res.json({ token: sign(u) });
};

export const login = async (req, res) => {
  let { email, password } = req.body;
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');

  const u = await User.findOne({ where: { email }, include: Role });
  if (!u || !compare(password, u.password_hash)) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  return res.json({
    token: sign(u),
    user: { id: u.id, name: u.name, email: u.email, role_id: u.role_id }
  });
};

export const microsoftLogin = (_req, res) => {
  return res.status(501).json({ message: 'Login con Microsoft pendiente de configuración' });
};

export const me = async (req, res) => {
  const u = await User.findByPk(req.user.id, {
    include: Role,
    attributes: ['id', 'name', 'email', 'role_id']
  });
  return res.json(u);
};
