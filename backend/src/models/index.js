import { sequelize } from '../config/db.js';
import Role from './Role.js';
import User from './User.js';
import Subject from './Subject.js';
import Semester from './Semester.js';
import Class from './Class.js';
import Question from './Question.js';
import Exam from './Exam.js';
import ExamQuestion from './ExamQuestion.js';
import Enrollment from './Enrollment.js';
import Assignment from './Assignment.js';
import AuditLog from './AuditLog.js';
import Submission from './Submission.js';
import SubmissionAnswer from './SubmissionAnswer.js';

// === Relaciones ===
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

Subject.hasMany(Question, { foreignKey: 'subject_id' });
Semester.hasMany(Question, { foreignKey: 'semester_id' });
Question.belongsTo(Subject, { foreignKey: 'subject_id' });
Question.belongsTo(Semester, { foreignKey: 'semester_id' });
User.hasMany(Question, { foreignKey: 'created_by' });
Question.belongsTo(User, { as: 'author', foreignKey: 'created_by' });

Subject.hasMany(Class, { foreignKey: 'subject_id' });
Semester.hasMany(Class, { foreignKey: 'semester_id' });
User.hasMany(Class, { foreignKey: 'owner_id' });
Class.belongsTo(Subject, { foreignKey: 'subject_id' });
Class.belongsTo(Semester, { foreignKey: 'semester_id' });
Class.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });

Class.hasMany(Exam, { foreignKey: 'class_id' });
Exam.belongsTo(Class, { foreignKey: 'class_id' });
User.hasMany(Exam, { foreignKey: 'created_by' });
Exam.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// Exam <-> Question
Exam.belongsToMany(Question, { through: ExamQuestion, foreignKey: 'exam_id', otherKey: 'question_id' });
Question.belongsToMany(Exam, { through: ExamQuestion, foreignKey: 'question_id', otherKey: 'exam_id' });

// Estudiantes inscritos
User.belongsToMany(Class, { through: Enrollment, foreignKey: 'user_id', otherKey: 'class_id' });
Class.belongsToMany(User, { through: Enrollment, foreignKey: 'class_id', otherKey: 'user_id' });

// Docentes asignados (generales)
User.belongsToMany(Class, { as: 'teaching', through: Assignment, foreignKey: 'user_id', otherKey: 'class_id' });
Class.belongsToMany(User, { as: 'teachers', through: Assignment, foreignKey: 'class_id', otherKey: 'user_id' });

// Aprobadores/revisores
Question.belongsTo(User, { as: 'approver', foreignKey: 'approved_by' });
Question.belongsTo(User, { as: 'rejector', foreignKey: 'rejected_by' });

// Submissions
Submission.belongsTo(User, { foreignKey: 'user_id' });
Submission.belongsTo(Exam, { foreignKey: 'exam_id' });
Submission.belongsTo(Class, { foreignKey: 'class_id' });
Submission.hasMany(SubmissionAnswer, { foreignKey: 'submission_id' });
SubmissionAnswer.belongsTo(Submission, { foreignKey: 'submission_id' });

// Audit
AuditLog.belongsTo(User, { as: 'actor', foreignKey: 'actor_id' });

export {
  sequelize, Role, User, Subject, Semester, Class,
  Question, Exam, ExamQuestion, Enrollment, Assignment,
  AuditLog, Submission, SubmissionAnswer
};
