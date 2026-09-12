import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Wraps protected routes.
 * - While auth is loading → show a full-screen spinner (prevents flash)
 * - If no authenticated user → redirect to /login (preserving intended URL)
 * - If authenticated → render child routes via <Outlet />
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-den-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-den-accent" />
          <p className="text-sm text-den-muted">Loading TheFitnessDen…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
