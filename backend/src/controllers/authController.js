import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, Role } from '../models/index.js';
import { compare, hash } from '../utils/password.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

const sign = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role_id: user.role_id },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

export async function register(req, res) {
  const { name, email, password, role_id } = req.body;

  if (!name || !email || !password || !role_id) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, role_id, password_hash });
    return res.status(201).json({ id: user.id });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }
    if (e.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: e.errors?.[0]?.message || 'Datos inválidos' });
    }
    throw e; // dejar que el handler global lo trate
  }
}

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
