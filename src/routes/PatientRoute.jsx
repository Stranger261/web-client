import { Route } from 'react-router';
import AuthProvider from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import PatientDashboard from '../pages/Patient/features/PatientDashboard';
import ConditionalLayout from '../layouts/ConditionalLayout';
import RegistrationSteps from '../pages/Patient/features/RegistrationSteps';

const PatientRoute = (
  <Route
    path="/patient"
    element={
      <ProtectedRoute requiredRole="patient">
        <AuthProvider>
          <ConditionalLayout />
        </AuthProvider>
      </ProtectedRoute>
    }
  >
    <Route path="complete-registration" element={<RegistrationSteps />} />
    <Route path="my-dashboard" element={<PatientDashboard />} />
  </Route>
);

export default PatientRoute;
