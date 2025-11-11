import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { allowRoles, ROLES } from '../middleware/roles.js';

import { login, register, me, microsoftLogin } from '../controllers/authController.js';
import { createSubject, listSubjects, createSemester, listSemesters } from '../controllers/taxonomyController.js';
import { createQuestion, approveQuestion, updateQuestion, deleteQuestion, listQuestions, rejectQuestion } from '../controllers/questionController.js';
import { createExam, publishExam, listExamsForClass, getExamForStudent, submitExam, listExams, getExamDetail } from '../controllers/examController.js';
import { classAveragesCsv } from '../controllers/reportController.js';
import { listClasses, createClass } from '../controllers/classController.js';
import { listUsers, deleteUsers, updateUsers } from '../controllers/userController.js';

const r = Router();

/* Public */
r.get('/config', getConfig);
function getConfig(_req, res) { res.json({ microsoftEnabled: false }); } // placeholder

r.post('/auth/login', login);
r.post('/auth/register', register);
r.get('/auth/microsoft', microsoftLogin);
r.get('/auth/microsoft/callback', microsoftLogin);
r.get('/auth/me', auth, me);

/* Taxonomías */
r.post('/subjects', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), createSubject);
r.get('/subjects', auth, listSubjects);
r.post('/semesters', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), createSemester);
r.get('/semesters', auth, listSemesters);

/* Clases */
r.get('/classes', auth, listClasses);
r.post('/classes', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), createClass);

/* Usuarios (combos docentes) */
r.get('/users', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), listUsers);
r.delete('/users/:id', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), deleteUsers);
r.put('/users/:id', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), updateUsers);

/* Preguntas */
r.post('/questions', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC, ROLES.DOC_GNR), createQuestion);
r.get('/questions', auth, listQuestions);
r.patch('/questions/:id', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), updateQuestion);
r.delete('/questions/:id', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), deleteQuestion);
r.post('/questions/:id/approve', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), approveQuestion);
r.post('/questions/:id/reject', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC), rejectQuestion);

/* Exámenes */
r.get('/exams', auth, listExams);
r.get('/exams/:id', auth, getExamDetail); // NUEVO: detalle (docentes ven respuestas)
r.post('/exams', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC, ROLES.DOC_GNR), createExam);
r.post('/exams/:id/publish', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC, ROLES.DOC_GNR), publishExam);
r.get('/classes/:classId/exams', auth, listExamsForClass);
r.get('/exams/:id/student', auth, getExamForStudent);
r.post('/exams/:id/submit', auth, submitExam);

/* Reportes */
r.get('/reports/class/:classId/averages.csv', auth, allowRoles(ROLES.ADMIN, ROLES.COORD, ROLES.DOC_TC, ROLES.DOC_GNR), classAveragesCsv);

export default r;
