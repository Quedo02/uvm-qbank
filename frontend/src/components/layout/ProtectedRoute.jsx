import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ user, initialized, children }) {
  const location = useLocation();
  if (!initialized) return <div style={{padding:40}}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
