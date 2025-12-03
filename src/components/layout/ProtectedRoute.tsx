import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { isAdmin, isPromoter } from '../../utils/userHelpers';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requirePromoter?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin, requirePromoter }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar admin usando helper
  const userIsAdmin = isAdmin(user);
  if (requireAdmin && !userIsAdmin) {
    return <Navigate to="/" replace />;
  }

  // Verificar promoter usando helper
  const userIsPromoter = isPromoter(user);
  if (requirePromoter && !userIsPromoter) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

