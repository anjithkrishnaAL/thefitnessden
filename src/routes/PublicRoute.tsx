import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Wraps public-only routes (/login, /signup, /forgot-password).
 * - While auth is loading → spinner
 * - If already authenticated → redirect to /dashboard
 * - If not authenticated → render child routes via <Outlet />
 */
export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-den-bg">
        <Loader2 size={32} className="animate-spin text-den-accent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
