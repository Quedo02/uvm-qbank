import { Subject, Semester } from '../models/index.js';

export const createSubject = async (req, res) => {
  const s = await Subject.create({ name: req.body.name });
  res.json(s);
};
export const listSubjects = async (_req, res) => res.json(await Subject.findAll());

export const createSemester = async (req, res) => {
  const s = await Semester.create({ name: req.body.name });
  res.json(s);
};
export const listSemesters = async (_req, res) => res.json(await Semester.findAll());
