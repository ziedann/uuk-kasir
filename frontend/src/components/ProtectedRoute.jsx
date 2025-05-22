import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User's role is not authorized, redirect to appropriate dashboard
    return <Navigate to={user.role === 'pelanggan' ? '/customer-dashboard' : '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute; 