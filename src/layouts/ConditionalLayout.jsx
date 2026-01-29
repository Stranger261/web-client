import { Navigate } from 'react-router-dom';

import BaseLayout from './BaseLayout';
import RegistrationLayout from './RegistrationLayout';

import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../components/shared/LoadingOverlay';

const ConditionalLayout = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="Loading..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.registration_status !== 'completed') {
    return <RegistrationLayout />;
  }

  return <BaseLayout />;
};

export default ConditionalLayout;
