export default function Topbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="u-badge" aria-label="UVM">U</div>
        <span className="topbar-title">Universidad del Valle de México</span>
      </div>
      <div className="topbar-right">
        <span className="user-pill">{user?.name}</span>
        <button className="button button-ghost" onClick={onLogout}>Salir</button>
      </div>
    </header>
  );
}
