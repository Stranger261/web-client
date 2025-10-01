import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';

import { useAuth } from '../context/AuthContext';
import LoadingOverlay from '../components/generic/LoadingOverlay';

const ProtectedRoutes = ({ children, requiredRole }) => {
  const { currentUser, isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== requiredRole) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [currentUser, isLoading, requiredRole]);

  if (isAuthorized === false && !isLoading) {
    return <Navigate to="/login" />;
  }

  if (isLoading) return <LoadingOverlay />;

  return children;
};

export default ProtectedRoutes;
