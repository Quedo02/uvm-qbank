import { Class, Subject, Semester, User } from '../models/index.js';
import { Op } from 'sequelize';

export const listClasses = async (req, res) => {
  const { q } = req.query;
  const where = {};
  if (q) where.name = { [Op.like]: `%${q}%` };

  const rows = await Class.findAll({
    where,
    include: [
      { model: Subject, attributes: ['id','name'] },
      { model: Semester, attributes: ['id','name'] },
      { model: User, as: 'owner', attributes: ['id','name','email'] }
    ],
    order: [['id','DESC']]
  });
  res.json(rows);
};

export const createClass = async (req, res) => {
  const { name, subject_id, semester_id, owner_id } = req.body;
  if (!name || !subject_id || !semester_id || !owner_id) {
    return res.status(400).json({ message: 'Faltan campos: name, subject_id, semester_id, owner_id' });
  }
  const cls = await Class.create({
    name,
    subject_id: Number(subject_id),
    semester_id: Number(semester_id),
    owner_id: Number(owner_id)
  });
  res.json(cls);
};
