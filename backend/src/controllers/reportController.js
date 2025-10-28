import { Exam, Submission } from '../models/index.js';

export const classAveragesCsv = async (req, res) => {
  const classId = Number(req.params.classId);
  const exams = await Exam.findAll({ where: { class_id: classId, status:'published' } });

  const rows = [['exam_id','title','submissions','avg_score']];
  for (const e of exams) {
    const subs = await Submission.findAll({ where: { exam_id: e.id } });
    const avg = subs.length ? (subs.reduce((a,b)=>a+(b.score||0),0)/subs.length) : 0;
    rows.push([e.id, e.title, subs.length, avg.toFixed(2)]);
  }

  const csv = rows.map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="class_${classId}_averages.csv"`);
  res.send(csv);
};
