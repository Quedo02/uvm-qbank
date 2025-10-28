export default function Input({ label, ...props }) {
  return (
    <label style={{ display:'grid', gap:6 }}>
      {label && <span style={{ fontSize:12, opacity:.8 }}>{label}</span>}
      <input {...props} />
    </label>
  );
}
