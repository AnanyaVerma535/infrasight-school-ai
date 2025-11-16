import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!authLoading && !roleLoading && user && role) {
      const isOfficerRoute = location.pathname.startsWith('/officer-dashboard');
      const isCitizenRoute = location.pathname.startsWith('/citizen-dashboard');

      if (role === 'officer' && isCitizenRoute) {
        navigate('/officer-dashboard', { replace: true });
      } else if (role === 'citizen' && isOfficerRoute) {
        navigate('/citizen-dashboard', { replace: true });
      }
    }
  }, [user, role, authLoading, roleLoading, navigate, location]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
