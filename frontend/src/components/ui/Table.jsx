// components/ui/Table.jsx
import { useMemo, useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Table mejorada — ahora detecta columna id y la reduce.
 */

export default function Table({
  columns = [],
  rows = [],
  defaultSort = null,
  actions = { show: true },
  onSave,
  onDelete,
  onEditStart,
  onEditCancel
}) {
  const getValue = (row, accessor) => {
    if (!accessor) return undefined;
    if (typeof accessor === 'function') return accessor(row);
    const parts = String(accessor).split('.');
    let v = row;
    for (const p of parts) {
      if (v == null) return undefined;
      v = v[p];
    }
    return v;
  };
  const setValue = (obj, accessor, value) => {
    if (!accessor || typeof accessor === 'function') return;
    const parts = String(accessor).split('.');
    let cur = obj;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) cur[p] = value;
      else {
        if (cur[p] == null) cur[p] = {};
        cur = cur[p];
      }
    }
  };

  // sorting
  const initialSort = useMemo(() => {
    if (defaultSort && defaultSort.accessor) {
      return { accessor: defaultSort.accessor, direction: defaultSort.direction === 'desc' ? 'desc' : 'asc' };
    }
    const first = columns.find(c => c.sortable !== false && c.accessor);
    if (first) return { accessor: first.accessor, direction: 'asc' };
    return null;
  }, [columns, defaultSort]);

  const [sort, setSort] = useState(initialSort);
  useEffect(() => setSort(initialSort), [initialSort]);

  const comparator = (a, b, accessor) => {
    const va = getValue(a, accessor);
    const vb = getValue(b, accessor);
    if (va == null && vb == null) return 0;
    if (va == null) return -1;
    if (vb == null) return 1;
    const na = Number(va), nb = Number(vb);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    const sa = String(va).toLowerCase(), sb = String(vb).toLowerCase();
    if (sa < sb) return -1;
    if (sa > sb) return 1;
    return 0;
  };

  const sortedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    if (!sort || !sort.accessor) return rows;
    const copy = [...rows];
    copy.sort((x, y) => {
      const cmp = comparator(x, y, sort.accessor);
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort]);

  const onHeaderClick = (col) => {
    if (col.sortable === false) return;
    const accessor = col.accessor;
    if (!accessor) return;
    setSort(prev => {
      if (!prev || prev.accessor !== accessor) return { accessor, direction: 'asc' };
      return { accessor, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };
  const renderSortIcon = (col) => {
    if (!sort || sort.accessor !== col.accessor) return null;
    return sort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // inline edit
  const [editingId, setEditingId] = useState(null);
  const [editedRow, setEditedRow] = useState(null);

  const startEdit = (row) => {
    setEditingId(row.id ?? null);
    setEditedRow(JSON.parse(JSON.stringify(row || {})));
    if (onEditStart) onEditStart(row);
  };
  const cancelEdit = (row) => {
    setEditingId(null);
    setEditedRow(null);
    if (onEditCancel) onEditCancel(row);
  };
  const handleChange = (accessor, value) => {
    setEditedRow(prev => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      setValue(copy, accessor, value);
      return copy;
    });
  };
  const handleSave = async () => {
    if (!editingId) return;
    if (onSave) await onSave(editingId, editedRow);
    setEditingId(null);
    setEditedRow(null);
  };
  const handleDelete = async (id) => {
    if (!id) return;
    if (onDelete) await onDelete(id);
  };

  // build effective columns: add actions column if needed
  const effectiveColumns = useMemo(() => {
    const cols = [...columns];
    if (actions?.show !== false) {
      cols.push({
        header: 'Acciones',
        key: '__actions',
        sortable: false,
        accessor: null,
        width: '160px', // un poco más compacto
        cell: (row) => {
          const isEditing = editingId === (row.id ?? null);
          if (isEditing) {
            return (
              <div style={{ display:'flex', gap:8, whiteSpace:'nowrap', justifyContent:'flex-end', alignItems:'center', boxSizing:'border-box' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ padding: '0.25rem .5rem' }}>Guardar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => cancelEdit(row)} style={{ padding: '0.25rem .5rem' }}>Cancelar</button>
              </div>
            );
          }
          return (
            <div style={{ display:'flex', gap:8, whiteSpace:'nowrap', justifyContent:'flex-end', alignItems:'center', boxSizing:'border-box' }}>
              <button className="btn btn-sm" onClick={() => startEdit(row)} style={{ padding: '.25rem .5rem' }}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} style={{ padding: '.25rem .5rem' }}>Eliminar</button>
            </div>
          );
        }
      });
    }
    return cols;
  }, [columns, actions, editingId, editedRow]);

  // styles
  const tableStyle = { width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' };
  const thStyleBase = { textAlign:'left', padding:'0.65rem', verticalAlign:'middle', textOverflow:'ellipsis', whiteSpace:'nowrap' };
  const tdStyleBase = { padding:'0.6rem', verticalAlign:'middle', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 };

  return (
    <table className="table" style={tableStyle}>
      <thead>
        <tr>
          {effectiveColumns.map((c, i) => {
            const isId = (c.accessor === 'id' || c.key === 'id');
            return (
              <th
                key={c.key ?? c.accessor ?? i}
                role={c.sortable === false ? undefined : 'button'}
                onClick={() => onHeaderClick(c)}
                className={isId ? 'id-col' : undefined}
                style={{
                  ...thStyleBase,
                  cursor: c.sortable === false ? 'default' : 'pointer',
                  userSelect: 'none',
                  width: c.width ?? (isId ? '72px' : undefined),
                  maxWidth: c.width ?? (isId ? '72px' : undefined),
                  textAlign: isId ? 'center' : undefined,
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.header}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderSortIcon(c)}</span>
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((r, ri) => {
          const isEditing = editingId === (r.id ?? null);
          return (
            <tr key={r.id ?? ri}>
              {effectiveColumns.map((c, ci) => {
                const key = c.key ?? c.accessor ?? ci;
                const isId = (c.accessor === 'id' || c.key === 'id');
                const cellCommonStyle = {
                  ...tdStyleBase,
                  width: c.width ?? (isId ? '72px' : undefined),
                  maxWidth: c.width ?? (isId ? '72px' : undefined),
                  textAlign: isId ? 'center' : undefined,
                };

                if (c.key === '__actions' && typeof c.cell === 'function') {
                  return <td key={key} style={{...cellCommonStyle, overflow:'visible'}} className="cell-actions">{c.cell(r)}</td>;
                }

                if (isEditing && c.editable) {
                  const val = getValue(editedRow, c.accessor);
                  if (c.cellEditor && typeof c.cellEditor === 'function') {
                    return (
                      <td key={key} style={{...cellCommonStyle, overflow:'visible'}} className="cell-editing">
                        <div style={{ minWidth: 0 }}>
                          {c.cellEditor({
                            value: val,
                            onChange: (v) => handleChange(c.accessor, v),
                            row: editedRow
                          })}
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td key={key} style={{...cellCommonStyle, overflow:'visible'}} className="cell-editing">
                      <input
                        className="form-control"
                        value={val ?? ''}
                        onChange={(e) => handleChange(c.accessor, e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}
                      />
                    </td>
                  );
                }

                if (typeof c.cell === 'function') {
                  return <td key={key} style={cellCommonStyle}>{c.cell(r)}</td>;
                }
                const plain = getValue(r, c.accessor);
                return <td key={key} style={cellCommonStyle} title={plain != null ? String(plain) : ''}>{plain}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
