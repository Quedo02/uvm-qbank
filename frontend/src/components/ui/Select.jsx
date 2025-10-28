export default function Select({ label, children, ...props }) {
  return (
    <label style={{ display:'grid', gap:6 }}>
      {label && <span style={{ fontSize:12, opacity:.8 }}>{label}</span>}
      <select {...props}>{children}</select>
    </label>
  );
}
