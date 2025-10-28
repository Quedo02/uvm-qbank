export default function Table({ columns=[], rows=[] }) {
  return (
    <table className="table">
      <thead>
        <tr>{columns.map(c => <th key={c.key || c.accessor}>{c.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={r.id || i}>
            {columns.map(c => <td key={c.key || c.accessor}>
              {typeof c.cell === 'function' ? c.cell(r) : r[c.accessor]}
            </td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
