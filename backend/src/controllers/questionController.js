import { Question, Class, Assignment } from '../models/index.js';
import { ROLES } from '../middleware/roles.js';
import { audit } from '../utils/audit.js';
import { Op } from 'sequelize';

/** Permiso: crear preguntas
 *  - ADMIN/COORD/DOC_TC: permitido
 *  - DOC_GNR: permitido SOLO si es owner o asignado en alguna clase con ese subject_id
 */
async function canCreateQuestionForSubject(user, subject_id) {
  if ([ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC].includes(user.role_id)) return true;
  if (user.role_id !== ROLES.DOC_GNR) return false;

  const owned = await Class.findOne({ where: { subject_id, owner_id: user.id } });
  if (owned) return true;

  const assigned = await Assignment.findOne({
    where: { user_id: user.id },
    include: [{ model: Class, required: true, where: { subject_id } }]
  });
  return !!assigned;
}

export const listQuestions = async (req, res) => {
  const { status, subject_id, semester_id, type, q } = req.query;
  const where = {};
  if (status) where.status = status;                // 'proposed' | 'approved' | 'rejected'
  if (subject_id) where.subject_id = Number(subject_id);
  if (semester_id) where.semester_id = Number(semester_id);
  if (type) where.type = type;                      // 'mcq_single' | 'true_false' | 'mcq_multi' | 'open'
  if (q) where.text = { [Op.like]: `%${q}%` };

  const rows = await Question.findAll({
    where,
    order: [['id', 'DESC']],
  });
  res.json(rows);
};

export const createQuestion = async (req, res) => {
  const { type, text, options, answer, subject_id, semester_id } = req.body;

  // Permisos reforzados
  const ok = await canCreateQuestionForSubject(req.user, Number(subject_id));
  if (!ok) {
    return res.status(403).json({ message: 'No tienes permiso para crear preguntas en esta materia.' });
  }

  const isHighRole = [ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC].includes(req.user.role_id);
  const q = await Question.create({
    type, text, options, answer, subject_id, semester_id,
    status: isHighRole ? 'approved' : 'proposed',
    created_by: req.user.id,
    reviewed_at: isHighRole ? new Date() : null,
    approved_by: isHighRole ? req.user.id : null
  });

  await audit({ actorId: req.user.id, entity:'question', entityId:q.id, action:'create', after:q.toJSON() });
  res.json(q);
};

export const approveQuestion = async (req, res) => {
  const q = await Question.findByPk(req.params.id);
  if (!q) return res.status(404).json({ message: 'No existe' });
  const before = q.toJSON();
  q.status = 'approved';
  q.review_comment = null;
  q.reviewed_at = new Date();
  q.approved_by = req.user.id;
  q.rejected_by = null;
  await q.save();
  await audit({ actorId: req.user.id, entity:'question', entityId:q.id, action:'approve', before, after:q.toJSON() });
  res.json(q);
};

export const rejectQuestion = async (req, res) => {
  const { comment } = req.body;
  const q = await Question.findByPk(req.params.id);
  if (!q) return res.status(404).json({ message: 'No existe' });
  const before = q.toJSON();
  q.status = 'rejected';
  q.review_comment = comment ?? null;
  q.reviewed_at = new Date();
  q.rejected_by = req.user.id;
  q.approved_by = null;
  await q.save();
  await audit({ actorId: req.user.id, entity:'question', entityId:q.id, action:'reject', before, after:q.toJSON(), meta:{ comment } });
  res.json(q);
};

export const updateQuestion = async (req, res) => {
  const q = await Question.findByPk(req.params.id);
  if (!q) return res.status(404).json({ message: 'No existe' });
  const before = q.toJSON();
  Object.assign(q, req.body);
  await q.save();
  await audit({ actorId: req.user.id, entity:'question', entityId:q.id, action:'update', before, after:q.toJSON() });
  res.json(q);
};

export const deleteQuestion = async (req, res) => {
  const q = await Question.findByPk(req.params.id);
  if (!q) return res.status(404).json({ message: 'No existe' });
  const before = q.toJSON();
  await q.destroy();
  await audit({ actorId: req.user.id, entity:'question', entityId:q.id, action:'delete', before });
  res.json({ ok: true });
};
