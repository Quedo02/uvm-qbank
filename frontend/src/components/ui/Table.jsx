// components/ui/Table.jsx
import { useMemo, useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Props:
 *  - columns: [{ header, accessor, cell?, key?, sortable?: true|false, editable?: true }]
 *  - rows: array
 *  - defaultSort: { accessor, direction }
 *  - actions?: { show?: boolean } // si false, no muestra columna acciones
 *  - onSave(rowId, newRow) => Promise|void
 *  - onDelete(rowId) => Promise|void
 *  - onEditStart(row) / onEditCancel(row)
 */
export default function Table({
  columns = [],
  rows = [],
  defaultSort = null,
  actions = { show: true },
  onSave,
  onDelete,
  onEditStart,
  onEditCancel,
}) {
  // helpers para paths 'a.b.c'
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
    if (!accessor) return;
    if (typeof accessor === 'function') {
      // no podemos setear si accessor es función; el padre debería proporcionar cell/editor
      return;
    }
    const parts = String(accessor).split('.');
    let cur = obj;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        cur[p] = value;
      } else {
        if (cur[p] == null) cur[p] = {};
        cur = cur[p];
      }
    }
  };

  // sorting (igual que tu original, con asc por defecto)
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

  // edición inline: id de fila en edición y datos editados
  const [editingId, setEditingId] = useState(null);
  const [editedRow, setEditedRow] = useState(null);

  const startEdit = (row) => {
    setEditingId(row.id ?? null);
    // clon profundo simple para editar sin mutar la original
    setEditedRow(JSON.parse(JSON.stringify(row || {})));
    if (onEditStart) onEditStart(row);
  };
  const cancelEdit = (row) => {
    setEditingId(null);
    setEditedRow(null);
    if (onEditCancel) onEditCancel(row);
  };
  const handleChange = (accessor, value) => {
    // modifica editedRow de forma inmutable
    setEditedRow(prev => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      setValue(copy, accessor, value);
      return copy;
    });
  };
  const handleSave = async () => {
    if (!editingId) return;
    if (onSave) {
      await onSave(editingId, editedRow);
    }
    setEditingId(null);
    setEditedRow(null);
  };
  const handleDelete = async (id) => {
    if (!id) return;
    if (onDelete) {
      await onDelete(id);
    }
  };

  // columnas efectivas: si actions.show true añadimos la columna Acciones al final
  const effectiveColumns = useMemo(() => {
    const cols = [...columns];
    if (actions?.show !== false) {
      cols.push({
        header: 'Acciones',
        key: '__actions',
        sortable: false,
        accessor: null,
        cell: (row) => {
          const isEditing = editingId === (row.id ?? null);
          if (isEditing) {
            return (
              <div style={{ display: 'inline-flex', gap: 6 }}>
                <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                <button className="btn btn-ghost" onClick={() => cancelEdit(row)}>Cancelar</button>
              </div>
            );
          }
          return (
            <div style={{ display: 'inline-flex', gap: 6 }}>
              <button className="btn btn-sm" onClick={() => startEdit(row)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>Eliminar</button>
            </div>
          );
        }
      });
    }
    return cols;
  }, [columns, actions, editingId, editedRow]);

  return (
    <table className="table">
      <thead>
        <tr>
          {effectiveColumns.map((c, i) => (
            <th
              key={c.key ?? c.accessor ?? i}
              role={c.sortable === false ? undefined : 'button'}
              onClick={() => onHeaderClick(c)}
              style={{ cursor: c.sortable === false ? 'default' : 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>{c.header}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderSortIcon(c)}</span>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((r, ri) => {
          const isEditing = editingId === (r.id ?? null);
          return (
            <tr key={r.id ?? ri}>
              {effectiveColumns.map((c, ci) => {
                // si la columna tiene cell, usarla — esto permite custom cells; si estamos en edición y la columna es editable:
                if (c.key === '__actions' && typeof c.cell === 'function') {
                  return <td key={c.key ?? ci}>{c.cell(r)}</td>;
                }
                if (isEditing && c.editable) {
                  const val = getValue(editedRow, c.accessor);
                  // input por defecto; si quieres selects/textarea, define cellEditor en la columna
                  if (c.cellEditor && typeof c.cellEditor === 'function') {
                    // permite al padre pasar un componente editor personalizado
                    return (
                      <td key={c.key ?? c.accessor ?? ci}>
                        {c.cellEditor({
                          value: val,
                          onChange: (v) => handleChange(c.accessor, v),
                          row: editedRow
                        })}
                      </td>
                    );
                  }
                  return (
                    <td key={c.key ?? c.accessor ?? ci}>
                      <input
                        className="input"
                        value={val ?? ''}
                        onChange={(e) => handleChange(c.accessor, e.target.value)}
                      />
                    </td>
                  );
                }
                // modo normal (no edición)
                if (typeof c.cell === 'function') {
                  return <td key={c.key ?? c.accessor ?? ci}>{c.cell(r)}</td>;
                }
                return <td key={c.key ?? c.accessor ?? ci}>{getValue(r, c.accessor)}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
