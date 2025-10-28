import { Op } from 'sequelize';
import {
  Exam, ExamQuestion, Question, Enrollment, Class, Assignment, Submission, SubmissionAnswer, Subject, Semester, User
} from '../models/index.js';
import { ROLES } from '../middleware/roles.js';
import { audit } from '../utils/audit.js';

// ===== Helpers =====
async function canTeachClass(user, class_id) {
  if ([ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC].includes(user.role_id)) return true;
  if (user.role_id !== ROLES.DOC_GNR) return false;
  const cls = await Class.findByPk(class_id);
  if (!cls) return false;
  if (cls.owner_id === user.id) return true;
  const ass = await Assignment.findOne({ where: { class_id, user_id: user.id } });
  return !!ass;
}
function stripAnswersForStudent(questions) {
  return questions.map(q => ({
    id: q.id,
    type: q.type,
    text: q.text,
    options: q.options
  }));
}
function sortByOrder(a, b) {
  const ao = a.exam_question?.order ?? 1;
  const bo = b.exam_question?.order ?? 1;
  return ao - bo;
}

// ===== List =====
export const listExams = async (req, res) => {
  const baseInclude = [
    { model: Class, include: [
      { model: Subject, attributes: ['id','name'] },
      { model: Semester, attributes: ['id','name'] },
      { model: User, as: 'owner', attributes: ['id','name'] }
    ] }
  ];

  let rows;
  if (req.user.role_id === ROLES.EST) {
    // Estudiante: ver solo publicados de sus clases
    const enrolls = await Enrollment.findAll({ where: { user_id: req.user.id } });
    const classIds = enrolls.map(e => e.class_id);
    rows = await Exam.findAll({
      where: { class_id: { [Op.in]: classIds }, status: 'published' },
      include: baseInclude,
      order: [['id','DESC']]
    });
  } else if (req.user.role_id === ROLES.DOC_GNR) {
    // Docente general: ver exámenes de clases propias o asignadas
    const own = await Class.findAll({ where: { owner_id: req.user.id } });
    const assigned = await Assignment.findAll({ where: { user_id: req.user.id } });
    const classIds = [
      ...own.map(c => c.id),
      ...assigned.map(a => a.class_id)
    ];
    rows = await Exam.findAll({
      where: { class_id: { [Op.in]: classIds } },
      include: baseInclude,
      order: [['id','DESC']]
    });
  } else {
    // Admin/Coord/Doc TC: ver todos
    rows = await Exam.findAll({ include: baseInclude, order: [['id','DESC']] });
  }

  res.json(rows);
};

// ===== Create =====
export const createExam = async (req, res) => {
  const { class_id, title, question_ids, starts_at, ends_at, time_limit_min, pick } = req.body;
  if (!(await canTeachClass(req.user, class_id))) {
    return res.status(403).json({ message: 'No puedes crear exámenes para clases ajenas' });
  }

  const exam = await Exam.create({
    class_id,
    title,
    created_by: req.user.id,
    status: 'draft',
    starts_at: starts_at ? new Date(starts_at) : null,
    ends_at: ends_at ? new Date(ends_at) : null,
    time_limit_min: time_limit_min ?? null,
    attempts_allowed: 1
  });

  let toLink = [];
  if (Array.isArray(question_ids) && question_ids.length) {
    toLink = question_ids;
  } else if (pick && Number(pick) > 0) {
    // autopick de preguntas APROBADAS por la materia de la clase
    const cls = await Class.findByPk(class_id);
    const pool = await Question.findAll({
      where: { subject_id: cls.subject_id, status: 'approved' },
      limit: Number(pick),
      order: [ [Exam.sequelize.fn('RAND'), 'ASC'] ] // selección pseudo-aleatoria
    });
    toLink = pool.map(q => q.id);
  }

  if (toLink.length) {
    const items = toLink.map((qid, i) => ({ exam_id: exam.id, question_id: qid, order: i+1 }));
    await ExamQuestion.bulkCreate(items);
  }

  await audit({ actorId: req.user.id, entity:'exam', entityId:exam.id, action:'create', after:exam.toJSON(), meta:{ question_ids: toLink } });
  res.json(exam);
};

// ===== Publish =====
export const publishExam = async (req, res) => {
  const exam = await Exam.findByPk(req.params.id);
  if (!exam) return res.status(404).json({ message: 'No existe' });
  if (!(await canTeachClass(req.user, exam.class_id))) {
    return res.status(403).json({ message: 'No puedes publicar exámenes de clases ajenas' });
  }
  const { starts_at, ends_at, time_limit_min } = req.body;
  const before = exam.toJSON();
  exam.status = 'published';
  exam.starts_at = starts_at ? new Date(starts_at) : null;
  exam.ends_at = ends_at ? new Date(ends_at) : null;
  exam.time_limit_min = time_limit_min ?? null;
  exam.attempts_allowed = 1;
  await exam.save();
  await audit({ actorId: req.user.id, entity:'exam', entityId:exam.id, action:'publish', before, after:exam.toJSON() });
  res.json(exam);
};

// ===== Detail (with questions) =====
export const getExamDetail = async (req, res) => {
  const id = Number(req.params.id);
  const exam = await Exam.findByPk(id, {
    include: [
      { model: Class, include: [
        { model: Subject, attributes: ['id','name'] },
        { model: Semester, attributes: ['id','name'] }
      ] },
      { model: Question, through: { attributes: ['order'] } }
    ]
  });
  if (!exam) return res.status(404).json({ message: 'No existe' });

  const now = new Date();
  const isTeacher = await canTeachClass(req.user, exam.class_id);
  const isAdmin = [ROLES.ADMIN, ROLES.COORD].includes(req.user.role_id);

  if (isTeacher || isAdmin) {
    // docentes ven preguntas + respuestas
    const questions = (exam.questions || []).sort(sortByOrder);
    return res.json({
      exam: {
        id: exam.id, title: exam.title, status: exam.status,
        starts_at: exam.starts_at, ends_at: exam.ends_at, time_limit_min: exam.time_limit_min,
        class: exam.class
      },
      questions
    });
  }

  // Estudiante: validar inscripción + ventana + estado publicado
  if (req.user.role_id === ROLES.EST) {
    const enrolled = await Enrollment.findOne({ where: { class_id: exam.class_id, user_id: req.user.id } });
    if (!enrolled) return res.status(403).json({ message: 'No estás inscrito en esta clase' });
    if (exam.status !== 'published') return res.status(403).json({ message: 'Examen no disponible' });
    if (exam.starts_at && now < new Date(exam.starts_at)) return res.status(403).json({ message: 'Aún no inicia' });
    if (exam.ends_at && now > new Date(exam.ends_at)) return res.status(403).json({ message: 'Ya finalizó' });

    const questions = stripAnswersForStudent((exam.questions || []).sort(sortByOrder));
    return res.json({
      exam: {
        id: exam.id, title: exam.title, status: exam.status,
        starts_at: exam.starts_at, ends_at: exam.ends_at, time_limit_min: exam.time_limit_min,
        class: exam.class
      },
      questions
    });
  }

  return res.status(403).json({ message: 'Forbidden' });
};

// ===== For student start (legacy, kept) =====
export const getExamForStudent = async (req, res) => {
  const examId = Number(req.params.id);
  const class_id = Number(req.query.class_id);
  // Debe estar inscrito
  const enrolled = await Enrollment.findOne({ where: { class_id, user_id: req.user.id } });
  if (!enrolled) return res.status(403).json({ message: 'No estás inscrito en esta clase' });

  const exam = await Exam.findByPk(examId, { include: [{ model: Question, through: { attributes: ['order'] } }] });
  if (!exam || exam.status !== 'published' || exam.class_id !== class_id) return res.status(404).json({ message: 'No disponible' });

  // ventana
  const now = new Date();
  if (exam.starts_at && now < new Date(exam.starts_at)) return res.status(403).json({ message: 'Aún no inicia' });
  if (exam.ends_at && now > new Date(exam.ends_at)) return res.status(403).json({ message: 'Ya finalizó' });

  const payload = (exam.questions || []).sort(sortByOrder).map(q => ({ id: q.id, type: q.type, text: q.text, options: q.options }));
  res.json({ exam: { id: exam.id, title: exam.title, time_limit_min: exam.time_limit_min, class_id }, questions: payload });
};

// ===== Submit =====
function isEqualAns(expected, given, type) {
  if (type === 'true_false') return Boolean(expected) === Boolean(given);
  if (type === 'mcq_single') return String(expected).toLowerCase() === String(given).toLowerCase();
  if (type === 'mcq_multi') {
    const a = Array.isArray(expected) ? expected.map(String).sort() : [];
    const b = Array.isArray(given) ? given.map(String).sort() : [];
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return null;
}

export const submitExam = async (req, res) => {
  const examId = Number(req.params.id);
  const class_id = Number(req.body.class_id);
  const answers = req.body.answers ?? []; // [{question_id, answer}]

  // Evita duplicado (un intento)
  const dup = await Submission.findOne({ where: { exam_id: examId, user_id: req.user.id } });
  if (dup) return res.status(403).json({ message: 'Ya realizaste este examen' });

  const exam = await Exam.findByPk(examId, { include: [{ model: Question, through: { attributes: ['order'] } }] });
  if (!exam || exam.class_id !== class_id) return res.status(404).json({ message: 'No disponible' });

  let correct_auto = 0, total_auto = 0;
  const sub = await Submission.create({ exam_id: examId, user_id: req.user.id, class_id });

  const ordered = (exam.questions || []).sort(sortByOrder);
  for (const q of ordered) {
    const given = answers.find(a => a.question_id === q.id)?.answer;
    const cmp = isEqualAns(q.answer, given, q.type);
    if (cmp !== null) { total_auto += 1; if (cmp === true) correct_auto += 1; }
    await SubmissionAnswer.create({
      submission_id: sub.id, question_id: q.id, answer: given,
      correct: (cmp === null ? null : Boolean(cmp))
    });
  }

  const score = total_auto ? (correct_auto/total_auto)*100 : 0;
  sub.correct_auto = correct_auto;
  sub.total_auto = total_auto;
  sub.score = score;
  sub.finished_at = new Date();
  await sub.save();

  await audit({ actorId: req.user.id, entity:'submission', entityId:sub.id, action:'submit',
    after: sub.toJSON(), meta: { answers_len: answers.length } });

  res.json({ correct_auto, total_auto, score });
};

// ===== Keep for compatibility =====
export const listExamsForClass = async (req, res) => {
  res.json(await Exam.findAll({ where: { class_id: req.params.classId }, order: [['id','DESC']] }));
};
