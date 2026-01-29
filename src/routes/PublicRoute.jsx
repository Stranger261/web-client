import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/shared/LoadingOverlay';

const PublicRoute = ({ children }) => {
  const { authState, currentUser } = useAuth();

  if (authState === 'INITIALIZING' || authState === 'LOGGING_OUT') {
    return <LoadingSpinner />;
  }

  if (authState === 'AUTHENTICATED' && currentUser) {
    const targetPath = `/${currentUser.role}/${
      currentUser.role === 'patient' ? 'my-' : ''
    }dashboard`;

    return <Navigate to={targetPath} replace />;
  }

  return children;
};

export default PublicRoute;
