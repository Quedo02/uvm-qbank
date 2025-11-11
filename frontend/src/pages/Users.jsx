// Users.jsx — MISMO comportamiento, SOLO estilos como Classes.jsx
import { useEffect, useState, useCallback } from 'react';
import Button from '../components/ui/Button.jsx';
import Table from '../components/ui/Table.jsx';
import Input from '../components/ui/Input.jsx';
import api from '../api/axios';
import Skeleton from '../components/ui/Skeleton.jsx';
import Modal, {ConfirmModal} from '../components/ui/Modal.jsx';
import { ChevronUp, ChevronDown } from 'lucide-react';

function TableSkeleton({ columnsCount = 4, rowsCount = 6 }) {
    const cols = Array.from({ length: columnsCount });
    const rows = Array.from({ length: rowsCount });
    return (
        <table className="table table-hover align-middle">
            <thead>
                <tr>
                    {cols.map((_, i) => (
                        <th key={i}>
                        <Skeleton height={14} width={80} radius={6} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((_, rIdx) => (
                    <tr key={rIdx}>
                        {cols.map((__, cIdx) => (
                        <td key={cIdx}>
                            <Skeleton height={14} width="70%" />
                        </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default function Users() {
    // --- UI / estados base ---
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role_id: '',
    });

    const [confirmState, setConfirmState] = useState({
        open: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        variant: 'danger',
        loading: false,
        onConfirm: null,
    });

    // este editingId sigue siendo usado para el modal (crear/editar vía modal)
    const [editingId, setEditingId] = useState(null);

    function askConfirm(opts) {
        setConfirmState((s) => ({
            ...s,
            open: true,
            title: opts.title || 'Confirmar acción',
            message: opts.message || '¿Seguro que quieres continuar?',
            confirmText: opts.confirmText || 'Confirmar',
            cancelText: opts.cancelText || 'Cancelar',
            variant: opts.variant || 'danger',
            onConfirm: opts.onConfirm || null,
        }));
    }

    function closeConfirm() {
        setConfirmState((s) => ({ ...s, open: false, loading: false, onConfirm: null }));
    }

    // helpers form
    const resetForm = () => setForm({ name: '', email: '', password: '', role_id: '' });
    const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    // fetch
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    async function fetchUsers() {
        try {
            const MIN_LOADING = 600;
            setLoading(true);
            setError('');
            const [res] = await Promise.all([api.get('/users'), sleep(MIN_LOADING)]);
            const data = res.data;
            setRows(Array.isArray(data) ? data : []);
            console.log('Usuarios: ', data);
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Error cargando usuarios';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCloseForm = useCallback(() => {
        resetForm();
        setShowForm(false);
        setEditingId(null);
    }, []);

    // submit (modal create / edit)
    async function handleSubmit(e) {
        e.preventDefault();

        if (!form.name || !form.email || !form.role_id) {
            alert('Completa los campos obligatorios (nombre, email, puesto).');
            return;
        }

        try {
            const payload = {
            name: form.name,
            email: form.email,
            role_id: Number(form.role_id),
            };

            if (form.password && String(form.password).trim() !== '') {
            payload.password = form.password;
            }

            if (editingId) {
            await api.put(`/users/${editingId}`, payload);
            } else {
            if (!payload.password) {
                alert('Para crear un usuario debes indicar una contraseña');
                return;
            }
            await api.post('/auth/register', payload);
            }

            resetForm();
            setEditingId(null);
            setShowForm(false);
            await fetchUsers();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Error';
            alert(msg);
        }
    }

    // handlers para edición inline (Opción B)
    async function handleInlineSave(id, newRow) {
        try {
            const payload = {
                name: newRow.name,
                email: newRow.email,
                role_id: Number(newRow.role_id),
            };
            await api.put(`/users/${id}`, payload);
            await fetchUsers(); // refrescar
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Error al guardar';
            alert(msg);
        }
    }

    async function handleInlineDelete(id) {
        if (!confirm('¿Eliminar usuario?')) return;
        try {
            await api.delete(`/users/${id}`);
            await fetchUsers();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Error al eliminar';
            alert(msg);
        }
    }

    // columnas: sin columna Acciones manual (Table la inyecta)
    const ROLE_LABEL = {
        1: 'Admin',
        2: 'Coordinador',
        3: 'Docente Tiempo Completo',
        4: 'Docente General',
        5: 'Estudiante',
    };

    const getRoleLabel = (id) => ROLE_LABEL[Number(id)] ?? `Rol ${id}`;

    const columns = [
        { header: '#', accessor: 'id' },
        { header: 'Nombre', accessor: 'name', editable: true },
        { header: 'Email', accessor: 'email', editable: true },
        {
            header: 'Puesto',
            accessor: 'role_id',
            editable: true,
            cell: (r) => getRoleLabel(r.role_id),
            cellEditor: ({ value, onChange }) => (
                <select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} className="form-control">
                    <option value="">Selecciona un rol</option>
                    {Object.entries(ROLE_LABEL).map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                    ))}
                </select>
            ),
        },
        {
            header: 'Password',
            accessor: 'password',
            editable: true,
            // no mostramos la contraseña real; sólo un placeholder/máscara
            cell: () => '••••••',
            cellEditor: ({ value, onChange }) => (
                <input
                type="password"
                className="form-control"
                value={value ?? ''}
                placeholder="Dejar vacío para mantener"
                onChange={(e) => onChange(e.target.value)}
                />
            )
        },
    ];

    return (
        <div className="row g-4">
            <section className="col-12">
                <div className="card p-4 shadow-sm">
                {/* Header estilo Classes.jsx */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Usuarios</h5>
                    <div className="d-flex gap-2">
                    <Button
                        className="btn btn-primary"
                        onClick={() => {resetForm(); setEditingId(null); setShowForm(true);}}
                    >
                        Nuevo usuario
                    </Button>
                    </div>
                </div>

                {/* Tabla / estados dentro del card */}
                {loading && <TableSkeleton columnsCount={columns.length} rowsCount={6} />}

                {!loading && error && (
                    <div className="alert alert-danger d-flex justify-content-between align-items-center">
                    <span>Error: {error}</span>
                    <button className="btn btn-sm btn-light" onClick={fetchUsers}>
                        Reintentar
                    </button>
                    </div>
                )}

                {!loading && !error && rows.length === 0 && (
                    <div className="text-muted">No hay usuarios aún</div>
                )}

                {!loading && !error && rows.length > 0 && (
                    <div className="table-responsive">
                    <Table
                        columns={columns}
                        rows={rows}
                        defaultSort={{ accessor: 'id', direction: 'asc' }}
                        onSave={handleInlineSave}
                        onDelete={handleInlineDelete}
                        // actions mostrará los botones Editar/Eliminar automáticamente
                    />
                    </div>
                )}
                </div>
            </section>

            {/* Modal: MISMO formulario, solo clases Bootstrap en inputs/botones para el look */}
            <Modal open={showForm} title={editingId ? "Editar usuario":"Nuevo usuario"} onClose={handleCloseForm} size="md">
                <form onSubmit={handleSubmit} className="d-grid gap-3">
                    <div>
                    <label className="form-label">Campos obligatorios <span className="text-danger">*</span></label>
                </div>
                <div>
                    <label className="form-label">Nombre <span className="text-danger">*</span></label>
                    <Input
                    className="form-control"
                    placeholder="Nombre del usuario"
                    value={form.name}
                    onChange={handleChange('name')}
                    autoFocus
                    />
                </div>

                <div>
                    <label className="form-label">Mail <span className="text-danger">*</span></label>
                    <Input
                    className="form-control"
                    placeholder="Mail"
                    value={form.email}
                    onChange={handleChange('email')}
                    />
                </div>

                <div>
                    <label className="form-label">Password <span className="text-danger">*</span></label>
                    <Input
                    className="form-control"
                    type="password"
                    placeholder="********"
                    value={form.password}
                    onChange={handleChange('password')}
                    />
                </div>

                <div className="mb-1">
                    <label className="form-label">Puesto <span className="text-danger">*</span></label>
                    <select
                    className="form-control"
                    value={form.role_id}
                    onChange={(e) => setForm(f => ({ ...f, role_id: Number(e.target.value) }))}>
                        <option value="">Selecciona un rol</option>
                        {Object.entries(ROLE_LABEL).map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                        ))}
                    </select>
                </div>

                    <div className="d-flex gap-2 justify-content-end">
                        <Button type="button" size="sm" variant="outline" onClick={handleCloseForm}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="btn btn-primary">
                            {editingId ? 'Actualizar':'Guardar'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                variant={confirmState.variant}
                loading={confirmState.loading}
                onClose={closeConfirm}
                onConfirm={async () => {
                    try {
                        setConfirmState((s) => ({ ...s, loading: true }));
                        await confirmState.onConfirm?.();
                    } catch (e) {
                        alert(e?.message || 'Ocurrió un error');
                    } finally {
                        closeConfirm();
                    }
                }}
            />
        </div>
    );
}
