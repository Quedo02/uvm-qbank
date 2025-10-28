import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import Skeleton from '../components/ui/Skeleton';

export default function Questions() {
  const [list, setList]           = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses]     = useState([]);
  const [loading, setLoading]     = useState(true);

  // filtros/orden
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState({ key:'id', dir:'desc' });

  const [type,setType] = useState('mcq_single');
  const [text,setText] = useState('');
  const [a,setA]=useState(''), [b,setB]=useState(''), [c,setC]=useState(''), [d,setD]=useState('');
  const [answer,setAnswer]=useState('a');
  const [tf,setTf]=useState(true);
  const [multi,setMulti]=useState([]);

  const [classId, setClassId] = useState('');
  const [subjectId,setSubject]=useState('');
  const [semesterId,setSem]=useState('');

  const subjectDisabled = !!classId;
  const semesterDisabled = !!classId;
  const toggleMulti = k => setMulti(prev=> prev.includes(k)? prev.filter(x=>x!==k): [...prev,k]);

  const load = async () => {
    setLoading(true);
    const [s,sm,c] = await Promise.all([api.get('/subjects'), api.get('/semesters'), api.get('/classes')]);
    setSubjects(s.data); setSemesters(sm.data); setClasses(c.data);
    await fetchList();
    setLoading(false);
  };
  const fetchList = async () => {
    const r = await api.get('/questions', { params: { q, status, type: typeFilter } });
    setList(r.data);
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (!classId) return;
    const cls = classes.find(x => String(x.id) === String(classId));
    if (cls) {
      setSubject(String(cls.subject_id || cls.subject?.id || ''));
      setSem(String(cls.semester_id || cls.semester?.id || ''));
    }
  }, [classId, classes]);

  const create = async e => {
    e.preventDefault();
    const ans = type==='mcq_single'? answer : type==='true_false'? Boolean(tf) : type==='mcq_multi'? multi : null;

    let sid = subjectId, semid = semesterId;
    if (classId) {
      const cls = classes.find(x => String(x.id) === String(classId));
      if (cls) { sid = String(cls.subject_id || cls.subject?.id || sid); semid = String(cls.semester_id || cls.semester?.id || semid); }
    }

    await api.post('/questions', {
      type, text,
      options: type==='open'? null : {a,b,c,d},
      answer: ans,
      subject_id: Number(sid),
      semester_id: Number(semid)
    });
    showToast('Pregunta guardada');
    setText(''); setA(''); setB(''); setC(''); setD('');
    setType('mcq_single'); setAnswer('a'); setTf(true); setMulti([]);
    setClassId(''); setSubject(''); setSem('');
    await fetchList();
  };

  const sorted = useMemo(() => {
    const arr = [...list];
    arr.sort((a,b)=>{
      const A = sort.key==='id' ? a.id
            : sort.key==='type' ? a.type
            : sort.key==='status' ? a.status
            : sort.key==='text' ? (a.text||'').toLowerCase()
            : a.id;
      const B = sort.key==='id' ? b.id
            : sort.key==='type' ? b.type
            : sort.key==='status' ? b.status
            : sort.key==='text' ? (b.text||'').toLowerCase()
            : b.id;
      if (A < B) return sort.dir==='asc' ? -1 : 1;
      if (A > B) return sort.dir==='asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [list, sort]);

  const toggleSort = (key) => setSort(s => s.key===key ? ({key, dir: s.dir==='asc'?'desc':'asc'}) : ({key, dir:'asc'}));
  const search = async (e) => { e.preventDefault(); await fetchList(); };

  return (
    <div className="row g-4">
      <aside className="col-lg-4">
        <div className="card p-4 shadow-sm">
          <h5 className="mb-3">Nueva pregunta</h5>
          <form onSubmit={create}>
            <div className="mb-3">
              <label className="form-label">Tipo</label>
              <select className="form-select" value={type} onChange={e=>setType(e.target.value)}>
                <option value="mcq_single">Opción múltiple (una)</option>
                <option value="true_false">Verdadero/Falso</option>
                <option value="mcq_multi">Selecciona varias</option>
                <option value="open">Abierta</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Texto</label>
              <textarea className="form-control" rows="2" required value={text} onChange={e=>setText(e.target.value)} />
            </div>

            {type!=='open' &&
              <div className="row g-2">
                <div className="col-6"><input className="form-control" placeholder="Opción A" value={a} onChange={e=>setA(e.target.value)} /></div>
                <div className="col-6"><input className="form-control" placeholder="Opción B" value={b} onChange={e=>setB(e.target.value)} /></div>
                <div className="col-6"><input className="form-control" placeholder="Opción C" value={c} onChange={e=>setC(e.target.value)} /></div>
                <div className="col-6"><input className="form-control" placeholder="Opción D" value={d} onChange={e=>setD(e.target.value)} /></div>
              </div>
            }

            {type==='mcq_single' &&
              <div className="mb-3 mt-2">
                <label className="form-label">Respuesta correcta</label>
                <select className="form-select" value={answer} onChange={e=>setAnswer(e.target.value)}>
                  <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                </select>
              </div>
            }

            {type==='true_false' &&
              <div className="mb-3 mt-2">
                <label className="form-label">Respuesta</label>
                <select className="form-select" value={String(tf)} onChange={e=>setTf(e.target.value==='true')}>
                  <option value="true">Verdadero</option><option value="false">Falso</option>
                </select>
              </div>
            }

            <div className="mb-2">
              <label className="form-label">Clase (opcional)</label>
              <select className="form-select" value={classId} onChange={e=>setClassId(e.target.value)}>
                <option value="">—</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} — {c.subject?.name}/{c.semester?.name}</option>)}
              </select>
              <div className="form-text">Si eliges clase, se usan su materia y semestre.</div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Materia</label>
                <select className="form-select" value={subjectId} onChange={e=>setSubject(e.target.value)} required disabled={subjectDisabled}>
                  <option value="">—</option>
                  {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Semestre</label>
                <select className="form-select" value={semesterId} onChange={e=>setSem(e.target.value)} required disabled={semesterDisabled}>
                  <option value="">—</option>
                  {semesters.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-primary w-100 mt-3">Guardar</button>
          </form>
        </div>
      </aside>

      <section className="col-lg-8">
        <div className="card p-4 shadow-sm">
          {/* Filtros */}
          <form className="row g-2 align-items-end mb-3" onSubmit={search}>
            <div className="col-sm-4">
              <label className="form-label mb-1">Buscar</label>
              <input className="form-control" placeholder="Texto de la pregunta..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <div className="col-sm-3">
              <label className="form-label mb-1">Estado</label>
              <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="proposed">Proposed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-sm-3">
              <label className="form-label mb-1">Tipo</label>
              <select className="form-select" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
                <option value="">Todos</option>
                <option value="mcq_single">Opción (1)</option>
                <option value="true_false">V/F</option>
                <option value="mcq_multi">Múltiple</option>
                <option value="open">Abierta</option>
              </select>
            </div>
            <div className="col-sm-2">
              <button className="btn btn-outline-primary w-100">Buscar</button>
            </div>
          </form>

          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th role="button" onClick={()=>toggleSort('id')}># {sort.key==='id' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('type')}>Tipo {sort.key==='type' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('text')}>Pregunta {sort.key==='text' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('status')}>Estado {sort.key==='status' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:3}).map((_,i)=>(
                  <tr key={i}><td colSpan="4"><Skeleton height={48} /></td></tr>
                ))
              ) : (
                sorted.map(r=>(
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{{mcq_single:'Opción (1)', true_false:'V/F', mcq_multi:'Múltiple', open:'Abierta'}[r.type]}</td>
                    <td>{r.text}</td>
                    <td><span className={`badge badge-status ${r.status}`}>{r.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
