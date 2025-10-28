import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import Skeleton from '../components/ui/Skeleton';

export default function Exams() {
  const nav = useNavigate();

  const [list,setList] = useState([]);
  const [classes,setClasses] = useState([]);
  const [loading,setLoading] = useState(true);

  const [title,setTitle] = useState('');
  const [classId,setClass] = useState('');
  const [startsAt,setStartsAt] = useState('');
  const [endsAt,setEndsAt] = useState('');
  const [timeLimit,setTimeLimit] = useState(60);
  const [pick,setPick] = useState(10);

  // filtros/orden
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key:'id', dir:'desc' });

  const load = async () => {
    setLoading(true);
    const [e,c] = await Promise.all([api.get('/exams'), api.get('/classes')]);
    setList(e.data); setClasses(c.data); setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const create = async e => {
    e.preventDefault();
    await api.post('/exams', {
      title,
      class_id: Number(classId),
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      time_limit_min: Number(timeLimit),
      pick: Number(pick)
    });
    showToast('Examen guardado');
    setTitle(''); setClass(''); setStartsAt(''); setEndsAt(''); setTimeLimit(60); setPick(10);
    await load();
  };

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(e =>
      String(e.id).includes(term) ||
      (e.title||'').toLowerCase().includes(term) ||
      (e.class?.name||'').toLowerCase().includes(term)
    );
  }, [list, q]);

  const sorted = useMemo(()=>{
    const arr = [...filtered];
    arr.sort((a,b)=>{
      const A = sort.key==='id' ? a.id
            : sort.key==='title' ? (a.title||'').toLowerCase()
            : sort.key==='class' ? (a.class?.name||'').toLowerCase()
            : sort.key==='status' ? (a.status||'').toLowerCase()
            : sort.key==='starts_at' ? (a.starts_at||'')
            : sort.key==='ends_at' ? (a.ends_at||'')
            : a.id;
      const B = sort.key==='id' ? b.id
            : sort.key==='title' ? (b.title||'').toLowerCase()
            : sort.key==='class' ? (b.class?.name||'').toLowerCase()
            : sort.key==='status' ? (b.status||'').toLowerCase()
            : sort.key==='starts_at' ? (b.starts_at||'')
            : sort.key==='ends_at' ? (b.ends_at||'')
            : b.id;
      if (A < B) return sort.dir==='asc' ? -1 : 1;
      if (A > B) return sort.dir==='asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  const toggleSort = (key) => setSort(s => s.key===key ? ({key, dir:s.dir==='asc'?'desc':'asc'}) : ({key, dir:'asc'}));

  return (
    <div className="row g-4">
      <aside className="col-lg-4">
        <div className="card p-4 shadow-sm">
          <h5 className="mb-3">Nuevo examen</h5>
          <form onSubmit={create}>
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Clase</label>
              <select className="form-select" value={classId} onChange={e=>setClass(e.target.value)} required>
                <option value="">—</option>
                {classes.map(c=><option key={c.id} value={c.id}>{c.name} — {c.subject?.name} / {c.semester?.name}</option>)}
              </select>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Inicio</label>
                <input type="datetime-local" className="form-control" value={startsAt} onChange={e=>setStartsAt(e.target.value)} />
              </div>
              <div className="col-6">
                <label className="form-label">Fin</label>
                <input type="datetime-local" className="form-control" value={endsAt} onChange={e=>setEndsAt(e.target.value)} />
              </div>
            </div>
            <div className="mb-2 mt-2">
              <label className="form-label">Duración (min)</label>
              <input type="number" min={1} className="form-control" value={timeLimit} onChange={e=>setTimeLimit(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label"># Preguntas (autopick aprobadas)</label>
              <input type="number" min={1} className="form-control" value={pick} onChange={e=>setPick(e.target.value)} />
            </div>
            <button className="btn btn-primary w-100">Guardar</button>
          </form>
        </div>
      </aside>

      <section className="col-lg-8">
        <div className="card p-4 shadow-sm">
          <div className="d-flex gap-2 align-items-end mb-3">
            <div className="flex-grow-1">
              <label className="form-label mb-1">Filtro</label>
              <input className="form-control" placeholder="Busca por título, clase..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
          </div>

          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th role="button" onClick={()=>toggleSort('id')}># {sort.key==='id' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('title')}>Examen {sort.key==='title' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('class')}>Clase {sort.key==='class' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('starts_at')}>Inicio {sort.key==='starts_at' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('ends_at')}>Fin {sort.key==='ends_at' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('status')}>Estado {sort.key==='status' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:3}).map((_,i)=>(
                  <tr key={i}><td colSpan="6"><Skeleton height={48} /></td></tr>
                ))
              ) : (
                sorted.map(e=>(
                  <tr key={e.id} role="button" onClick={()=>nav(`/exams/${e.id}`)}>
                    <td>{e.id}</td>
                    <td>{e.title}</td>
                    <td>{e.class?.name || '—'}</td>
                    <td>{e.starts_at ?? '—'}</td>
                    <td>{e.ends_at ?? '—'}</td>
                    <td>
                      <span className={`badge badge-status ${e.status === 'published' ? 'approved' : 'proposed'}`}>
                        {e.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
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
