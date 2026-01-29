import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/shared/LoadingOverlay';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { authState, currentUser } = useAuth();
  const location = useLocation();

  if (authState === 'INITIALIZING') {
    return <LoadingSpinner />;
  }

  if (authState === 'UNAUTHENTICATED' || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
