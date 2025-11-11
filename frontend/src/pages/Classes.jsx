// Classes.jsx
import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import Skeleton from '../components/ui/Skeleton';
import Table from '../components/ui/Table';

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
  const [sort, setSort] = useState({ key: 'id', dir: 'asc' });

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
    try {
      const [c, s, sm, u] = await Promise.all([
        api.get('/classes', { params: { q } }),
        api.get('/subjects'),
        api.get('/semesters'),
        api.get('/users', { params: { roles: '3,4' } })
      ]);
      setList(Array.isArray(c.data) ? c.data : c.data || []);
      setSubjects(Array.isArray(s.data) ? s.data : s.data || []);
      setSemesters(Array.isArray(sm.data) ? sm.data : sm.data || []);
      setTeachers(Array.isArray(u.data) ? u.data : u.data || []);
    } catch (err) {
      console.error(err);
      showToast('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);
  const search = async (e) => { e.preventDefault(); await loadAll(); };

  const createClass = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', {
        name: className,
        subject_id: Number(subjectId),
        semester_id: Number(semesterId),
        owner_id: Number(ownerId)
      });
      showToast('Clase creada');
      setSubject(''); setSemester(''); setOwner('');
      await loadAll();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || err.message || 'Error al crear clase');
    }
  };

  const accessorForKey = (key) => {
    if (key === 'id') return 'id';
    if (key === 'name') return 'name';
    if (key === 'subject') return 'subject.name';
    if (key === 'semester') return 'semester.name';
    if (key === 'owner') return 'owner.name';
    return 'id';
  };

  // En Classes.jsx
  const columns = [
    { header: '#', accessor: 'id', width: '60px' },

    // Clase: deja el input por defecto si te gusta editar a mano
    { header: 'Clase', accessor: 'name', width: '30%', editable: true },

    // Materia: editar por subject_id con select
    {
      header: 'Materia',
      accessor: 'subject_id',            // <— editar por ID
      editable: true,
      width: '22%',
      cell: (r) => r.subject?.name || '—', // <— mostrar nombre
      cellEditor: ({ value, onChange }) => (
        <select
          className="form-select"
          value={value ?? ''}
          onChange={e => onChange(Number(e.target.value) || '')}
        >
          <option value="">Selecciona una materia</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      ),
    },

    // Semestre: igual que materia
    {
      header: 'Semestre',
      accessor: 'semester_id',
      editable: true,
      width: '18%',
      cell: (r) => r.semester?.name || '—',
      cellEditor: ({ value, onChange }) => (
        <select
          className="form-select"
          value={value ?? ''}
          onChange={e => onChange(Number(e.target.value) || '')}
        >
          <option value="">Selecciona un semestre</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      ),
    },

    // Docente: editar por owner_id con select de teachers
    {
      header: 'Docente',
      accessor: 'owner_id',              // <— **cambia de owner.name a owner_id**
      editable: true,
      width: '30%',
      cell: (r) => r.owner?.name || '—',
      cellEditor: ({ value, onChange }) => (
        <select
          className="form-select"
          value={value ?? ''}
          onChange={e => onChange(Number(e.target.value) || '')}
        >
          <option value="">Selecciona un docente</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.email}
            </option>
          ))}
        </select>
      ),
    },
  ];

  const handleRowSave = async (id, edited) => {
    try {
      await api.put(`/classes/${id}`, {
        name: edited.name,
        subject_id: edited.subject_id ?? edited.subject?.id ?? null,
        semester_id: edited.semester_id ?? edited.semester?.id ?? null,
        owner_id: edited.owner_id ?? edited.owner?.id ?? null,
      });
      showToast('Clase actualizada');
      await loadAll(); // recarga para reflejar los nombres correctos
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">
          <i className="bi bi-journal-bookmark-fill text-primary me-2"></i>
          Gestión de Clases
        </h2>
        <p className="text-muted mb-0">Administra las clases, materias y asignaciones de docentes</p>
      </div>

      <div className="row g-4">
        {/* Sidebar - Formulario */}
        <aside className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div>
                  <h5 className="mb-0 fw-bold">Nueva Clase</h5>
                  <small className="text-muted">Completa los campos requeridos</small>
                </div>
              </div>

              <form onSubmit={createClass}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-book me-2 text-primary"></i>
                    Materia (Clase)
                  </label>
                  <select 
                    className="form-select border-2" 
                    value={subjectId} 
                    onChange={e => setSubject(e.target.value)} 
                    required
                  >
                    <option value="">Selecciona una materia</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-calendar3 me-2 text-primary"></i>
                    Semestre
                  </label>
                  <select 
                    className="form-select border-2" 
                    value={semesterId} 
                    onChange={e => setSemester(e.target.value)} 
                    required
                  >
                    <option value="">Selecciona un semestre</option>
                    {semesters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-tag me-2 text-success"></i>
                    Nombre generado
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-2">
                      <i className="bi bi-check-circle text-success"></i>
                    </span>
                    <input 
                      className="form-control border-2 bg-light" 
                      value={className} 
                      readOnly 
                      placeholder="Selecciona Materia y Semestre" 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-person-badge me-2 text-primary"></i>
                    Docente
                  </label>
                  <select 
                    className="form-select border-2" 
                    value={ownerId} 
                    onChange={e => setOwner(e.target.value)} 
                    required
                  >
                    <option value="">Selecciona un docente</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.email}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="btn btn-primary w-100 py-3 fw-semibold shadow-sm">
                  <i className="bi bi-save me-2"></i>
                  Guardar Clase
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content - Tabla */}
        <section className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {/* Search Header */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">
                    <i className="bi bi-list-ul text-primary me-2"></i>
                    Listado de Clases
                  </h5>
                  <small className="text-muted">
                    {loading ? 'Cargando...' : `${list.length} clase${list.length !== 1 ? 's' : ''} registrada${list.length !== 1 ? 's' : ''}`}
                  </small>
                </div>

                <form className="d-flex gap-2" onSubmit={search}>
                  <div className="input-group" style={{ minWidth: '280px' }}>
                    <span className="input-group-text bg-light border-2">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input 
                      className="form-control border-2" 
                      placeholder="Buscar por nombre..." 
                      value={q} 
                      onChange={e => setQ(e.target.value)} 
                    />
                  </div>
                  <button className="btn btn-outline-primary px-4 border-2">
                    <i className="bi bi-funnel me-2"></i>
                    Filtrar
                  </button>
                </form>
              </div>

              {/* Table */}
              <div className="table-responsive">
                {loading ? (
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold">#</th>
                        <th className="fw-semibold">Clase</th>
                        <th className="fw-semibold">Materia</th>
                        <th className="fw-semibold">Semestre</th>
                        <th className="fw-semibold">Docente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan="5"><Skeleton height={48} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Table
                    columns={columns}
                    rows={list}
                    defaultSort={{
                      accessor: accessorForKey(sort.key),
                      direction: sort.dir === 'asc' ? 'asc' : 'desc'
                    }}
                    onSave={handleRowSave}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}