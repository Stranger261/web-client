import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/shared/LoadingOverlay';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute RENDER:', {
    timestamp: new Date().toISOString(),
    path: location.pathname,
    isLoading,
    hasCurrentUser: !!currentUser,
    currentUser: currentUser
      ? {
          email: currentUser.email,
          role: currentUser.role,
          registration_status: currentUser.registration_status,
        }
      : null,
    requiredRole,
  });

  // Show loading while checking auth
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Still loading, showing spinner');
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

  console.log('✅ ProtectedRoute: Access granted, rendering children');
  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
