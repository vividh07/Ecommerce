import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { shouldSkipAuthFrom } from '../../lib/authRedirect';
import { Skeleton } from '../ui/Skeleton';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Skeleton className="mx-auto mt-12 h-48 max-w-md w-full" />;
  if (!user) {
    if (shouldSkipAuthFrom()) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
