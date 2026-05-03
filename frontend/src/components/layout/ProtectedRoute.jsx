import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ type = 'user', children }) {
  const { user, admin, loading } = useAuth();

  if (loading && type === 'user') {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">Loading...</div>;
  }

  if (type === 'user' && !user) {
    return <Navigate to="/login" replace />;
  }

  if (type === 'admin' && !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

