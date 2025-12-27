import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/shared/LoadingOverlay';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    console.log('❌ ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required but doesn't match, redirect to login
  if (requiredRole && currentUser.role !== requiredRole) {
    console.log(
      `❌ ProtectedRoute: Role mismatch - required: ${requiredRole}, got: ${currentUser.role}`
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
