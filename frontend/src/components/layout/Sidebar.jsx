import { NavLink } from 'react-router-dom';

const roleName = {1:'Admin',2:'Coordinador',3:'Docente TC',4:'Docente',5:'Estudiante'};

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="sb d-flex flex-column p-3">
      {/* Logo UVM */}
      <div className="d-flex justify-content-center mb-4">
        <div className="brand d-flex align-items-center gap-2">
          <img src="/uvm-logo-blanco.png" alt="UVM" height={96} />
          <span className="uni">Universidad del Valle de México</span>
        </div>
      </div>


      {/* Usuario */}
      <div className="user">
        <div className="avatar">
          <i className="bi bi-person-fill" />
        </div>
        <div className="lh-sm">
          <div className="name">{user?.name || 'Usuario'}</div>
          <div className="role">{roleName[user?.role_id] || '—'}</div>
        </div>
      </div>

      {/* Navegación (más grande) */}
      <ul className="nav nav-pills flex-column">
        <li className="nav-item">
          <NavLink end to="/" className="nav-link">
            <i className="bi bi-speedometer2"></i> Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/questions" className="nav-link">
            <i className="bi bi-question-circle"></i> Preguntas
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/exams" className="nav-link">
            <i className="bi bi-journal-text"></i> Exámenes
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/classes" className="nav-link">
            <i className="bi bi-people"></i> Clases
          </NavLink>
        </li>
      </ul>

      {/* Logout */}
      <div className="mt-auto">
        <button onClick={onLogout} className="btn btn-light w-100 logout d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-box-arrow-right"></i> Salir
        </button>
      </div>
    </aside>
  );
}
