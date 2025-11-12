import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'artisan';
}
export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  if (role && user?.role !== role) {
    // Redirect to a generic dashboard or home if role doesn't match
    const fallbackPath = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/artisan';
    return <Navigate to={fallbackPath} replace />;
  }
  return <>{children}</>;
}