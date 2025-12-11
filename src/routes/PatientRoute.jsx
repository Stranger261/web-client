import { Route } from 'react-router';
import ProtectedRoute from './ProtectedRoute';

import AuthProvider from '../contexts/AuthContext';
import AppointmentProvider from '../contexts/AppointmentContext';
import ScheduleProvider from '../contexts/ScheduleContext';

import ConditionalLayout from '../layouts/ConditionalLayout';

import PatientDashboard from '../pages/Patient/features/PatientDashboard';
import RegistrationSteps from '../pages/Patient/features/RegistrationSteps';
import PatientAppointment from '../pages/Patient/features/PatientAppointment';
import PatientMedicalHistory from '../pages/Patient/features/PatientMedicalHistory';
import PatientDetails from '../pages/Patient/features/PatientDetails';
import PatientSettings from '../pages/Patient/features/PatientSettings';
const PatientRoute = (
  <Route
    path="/patient"
    element={
      <ProtectedRoute requiredRole="patient">
        <AuthProvider>
          <AppointmentProvider>
            <ScheduleProvider>
              <ConditionalLayout />
            </ScheduleProvider>
          </AppointmentProvider>
        </AuthProvider>
      </ProtectedRoute>
    }
  >
    <Route path="complete-registration" element={<RegistrationSteps />} />
    <Route path="my-dashboard" element={<PatientDashboard />} />
    <Route path="my-appointments" element={<PatientAppointment />} />
    <Route path="my-medical-history" element={<PatientMedicalHistory />} />
    <Route path="my-details" element={<PatientDetails />} />
    <Route path="my-settings" element={<PatientSettings />} />
  </Route>
);

export default PatientRoute;
