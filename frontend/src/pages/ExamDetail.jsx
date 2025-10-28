import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { showToast } from '../utils/toast';

export default function ExamDetail() {
  const { id } = useParams();
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null); // { exam, questions }
  const [loading, setLoading] = useState(true);

  // para estudiante que inicia
  const [taking, setTaking] = useState(false);
  const [answers, setAnswers] = useState({}); // qid -> value
  const [result, setResult] = useState(null); // {correct_auto,total_auto,score}

  const role = me?.role_id;
  const isStudent = role === 5;

  useEffect(()=>{
    (async ()=>{
      const [meRes, exRes] = await Promise.all([
        api.get('/auth/me'),
        api.get(`/exams/${id}`)
      ]);
      setMe(meRes.data);
      setData(exRes.data);
      setLoading(false);
    })().catch(()=>setLoading(false));
  }, [id]);

  const canStart = useMemo(()=>{
    if (!isStudent || !data?.exam) return false;
    const e = data.exam;
    return e.status==='published';
  }, [isStudent, data]);

  // UI de respuesta según tipo
  const AnswerInput = ({ q }) => {
    if (q.type === 'true_false') {
      return (
        <select className="form-select" value={String(answers[q.id] ?? '')} onChange={e=>setAnswers(a=>({...a, [q.id]: e.target.value==='true'}))}>
          <option value="">—</option>
          <option value="true">Verdadero</option>
          <option value="false">Falso</option>
        </select>
      );
    }
    if (q.type === 'mcq_single') {
      return (
        <select className="form-select" value={answers[q.id] ?? ''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}>
          <option value="">—</option>
          {Object.entries(q.options||{}).map(([k,v])=><option key={k} value={k}>{k.toUpperCase()}. {v}</option>)}
        </select>
      );
    }
    if (q.type === 'mcq_multi') {
      const toggle = (k) => setAnswers(a=>{
        const cur = Array.isArray(a[q.id]) ? a[q.id] : [];
        return { ...a, [q.id]: cur.includes(k) ? cur.filter(x=>x!==k) : [...cur, k] };
      });
      return (
        <div>
          {Object.entries(q.options||{}).map(([k,v])=>(
            <div key={k} className="form-check">
              <input className="form-check-input" type="checkbox" id={`q${q.id}-${k}`}
                     checked={Array.isArray(answers[q.id]) && answers[q.id].includes(k)} onChange={()=>toggle(k)} />
              <label className="form-check-label" htmlFor={`q${q.id}-${k}`}>{k.toUpperCase()}. {v}</label>
            </div>
          ))}
        </div>
      );
    }
    // open
    return (
      <textarea className="form-control" rows={2} value={answers[q.id]??''} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} />
    );
  };

  const startExam = async () => {
    try {
      // Cargar versión estudiante (sin respuestas) y mostrar formulario
      setTaking(true);
      if (!data?.questions?.length) {
        const r = await api.get(`/exams/${id}/student`, { params: { class_id: data.exam.class.id ?? data.exam.class_id } });
        setData({ exam: { ...data.exam, time_limit_min: r.data.exam.time_limit_min }, questions: r.data.questions });
      }
    } catch (e) {
      setTaking(false);
      showToast(e?.response?.data?.message || 'No se pudo iniciar el examen');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = Object.entries(answers).map(([qid, val])=>({ question_id: Number(qid), answer: val }));
    const r = await api.post(`/exams/${id}/submit`, { class_id: data.exam.class.id ?? data.exam.class_id, answers: payload });
    setResult(r.data);
    showToast('Examen enviado');
  };

  if (loading) return <div className="p-4">Cargando…</div>;
  if (!data) return <div className="p-4">No encontrado</div>;

  const e = data.exam;
  const qs = data.questions || [];

  return (
    <div className="container" style={{maxWidth: 1000}}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="mb-0">{e.title} <small className="text-muted">#{e.id}</small></h3>
        <span className={`badge badge-status ${e.status==='published'?'approved':'proposed'}`}>
          {e.status==='published' ? 'Publicado' : 'Borrador'}
        </span>
      </div>
      <div className="text-muted mb-3">
        Clase: <strong>{e.class?.name}</strong> · Semestre: {e.class?.semester?.name} · Materia: {e.class?.subject?.name}
        {e.time_limit_min ? <> · Límite: {e.time_limit_min} min</> : null}
      </div>

      {/* Docentes/Admin ven respuestas */}
      {!isStudent && (
        <div className="card p-3 shadow-sm mb-4">
          <h6 className="mb-3">Preguntas del examen (incluye respuestas correctas)</h6>
          <ol className="mb-0">
            {qs.map(q=>(
              <li key={q.id} className="mb-3">
                <div className="fw-semibold">{q.text}</div>
                {q.options && <ul className="mb-1">
                  {Object.entries(q.options).map(([k,v])=>(
                    <li key={k}>{k.toUpperCase()}. {v}</li>
                  ))}
                </ul>}
                {'answer' in q && q.answer !== undefined && q.answer !== null && (
                  <div className="text-success"><i className="bi bi-check-circle"></i> Respuesta: {Array.isArray(q.answer) ? q.answer.join(', ').toUpperCase() : (typeof q.answer==='boolean'? (q.answer?'Verdadero':'Falso') : String(q.answer).toUpperCase())}</div>
                )}
                <div className="small text-muted">Tipo: {q.type}</div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Estudiante: hacer examen */}
      {isStudent && (
        <div className="card p-3 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Resolución del examen</h6>
            {!taking && canStart && <button className="btn btn-primary btn-sm" onClick={startExam}>Iniciar</button>}
          </div>

          {!taking && !canStart && (
            <div className="alert alert-info mb-0">Este examen no está disponible para ti en este momento.</div>
          )}

          {taking && result === null && (
            <form onSubmit={submit}>
              <ol className="mb-3">
                {qs.map(q=>(
                  <li key={q.id} className="mb-3">
                    <div className="fw-semibold">{q.text}</div>
                    {q.options && <div className="mb-2 small text-muted">Selecciona tu respuesta</div>}
                    <AnswerInput q={q} />
                  </li>
                ))}
              </ol>
              <button className="btn btn-success">Enviar</button>
            </form>
          )}

          {result && (
            <div className="alert alert-success mb-0">
              <div><strong>Tu resultado:</strong></div>
              <div>Correctas (auto): {result.correct_auto} / {result.total_auto}</div>
              <div>Puntaje (auto): {result.score.toFixed?.(2) ?? result.score}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
