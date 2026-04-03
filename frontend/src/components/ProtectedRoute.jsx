import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
