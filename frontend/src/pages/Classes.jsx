import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import Skeleton from '../components/ui/Skeleton';

export default function Classes() {
  const [list, setList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // form
  const [subjectId, setSubject] = useState('');
  const [semesterId, setSemester] = useState('');
  const [ownerId, setOwner] = useState('');

  // filtros/orden
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: 'id', dir: 'desc' });

  const subjectName = useMemo(
    () => subjects.find(s => String(s.id) === String(subjectId))?.name || '',
    [subjects, subjectId]
  );
  const semesterName = useMemo(
    () => semesters.find(s => String(s.id) === String(semesterId))?.name || '',
    [semesters, semesterId]
  );
  const className = useMemo(() => {
    if (!subjectName) return '';
    return semesterName ? `${subjectName} (${semesterName})` : subjectName;
  }, [subjectName, semesterName]);

  const loadAll = async () => {
    setLoading(true);
    const [c, s, sm, u] = await Promise.all([
      api.get('/classes', { params: { q } }),
      api.get('/subjects'),
      api.get('/semesters'),
      api.get('/users', { params: { roles: '3,4' } })
    ]);
    setList(c.data);
    setSubjects(s.data);
    setSemesters(sm.data);
    setTeachers(u.data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);
  const search = async (e) => { e.preventDefault(); await loadAll(); };

  const createClass = async (e) => {
    e.preventDefault();
    await api.post('/classes', {
      name: className,
      subject_id: Number(subjectId),
      semester_id: Number(semesterId),
      owner_id: Number(ownerId)
    });
    showToast('Clase creada');
    setSubject(''); setSemester(''); setOwner('');
    await loadAll();
  };

  const sorted = useMemo(() => {
    const arr = [...list];
    arr.sort((a,b)=>{
      const A = sort.key === 'id' ? a.id
              : sort.key === 'name' ? (a.name||'').toLowerCase()
              : sort.key === 'subject' ? (a.subject?.name||'').toLowerCase()
              : sort.key === 'semester' ? (a.semester?.name||'').toLowerCase()
              : sort.key === 'owner' ? (a.owner?.name||'').toLowerCase()
              : a.id;
      const B = sort.key === 'id' ? b.id
              : sort.key === 'name' ? (b.name||'').toLowerCase()
              : sort.key === 'subject' ? (b.subject?.name||'').toLowerCase()
              : sort.key === 'semester' ? (b.semester?.name||'').toLowerCase()
              : sort.key === 'owner' ? (b.owner?.name||'').toLowerCase()
              : b.id;
      if (A < B) return sort.dir === 'asc' ? -1 : 1;
      if (A > B) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [list, sort]);

  const toggleSort = (key) =>
    setSort(s => s.key === key ? ({ key, dir: s.dir==='asc' ? 'desc':'asc' }) : ({ key, dir:'asc' }));

  return (
    <div className="row g-4">
      <aside className="col-lg-4">
        <div className="card p-4 shadow-sm">
          <h5 className="mb-3">Nueva clase</h5>
          <form onSubmit={createClass}>
            <div className="mb-3">
              <label className="form-label">Materia (Clase)</label>
              <select className="form-select" value={subjectId} onChange={e=>setSubject(e.target.value)} required>
                <option value="">—</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Semestre</label>
              <select className="form-select" value={semesterId} onChange={e=>setSemester(e.target.value)} required>
                <option value="">—</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Nombre generado</label>
              <input className="form-control" value={className} readOnly placeholder="Selecciona Materia y Semestre" />
            </div>
            <div className="mb-4">
              <label className="form-label">Dueño (docente)</label>
              <select className="form-select" value={ownerId} onChange={e=>setOwner(e.target.value)} required>
                <option value="">—</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} — {t.email}</option>)}
              </select>
            </div>
            <button className="btn btn-primary w-100">Guardar</button>
          </form>
        </div>
      </aside>

      <section className="col-lg-8">
        <div className="card p-4 shadow-sm">
          <div className="d-flex gap-2 align-items-end mb-3">
            <form className="d-flex gap-2" onSubmit={search}>
              <div>
                <label className="form-label mb-1">Filtro</label>
                <input className="form-control" placeholder="Buscar por nombre..." value={q} onChange={e=>setQ(e.target.value)} />
              </div>
              <button className="btn btn-outline-primary">Buscar</button>
            </form>
          </div>

          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th role="button" onClick={()=>toggleSort('id')}># {sort.key==='id' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('name')}>Clase {sort.key==='name' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('subject')}>Materia {sort.key==='subject' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('semester')}>Semestre {sort.key==='semester' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
                <th role="button" onClick={()=>toggleSort('owner')}>Dueño {sort.key==='owner' ? (sort.dir==='asc'?'▲':'▼') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:4}).map((_,i)=>(
                  <tr key={i}><td colSpan="5"><Skeleton height={48} /></td></tr>
                ))
              ) : (
                sorted.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.subject?.name || '—'}</td>
                    <td>{c.semester?.name || '—'}</td>
                    <td>{c.owner?.name || '—'}</td>
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
