import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout({ user, onLogout }) {
  return (
    <div className="d-flex">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-fill p-4">
        <Outlet />
      </main>
    </div>
  );
}
