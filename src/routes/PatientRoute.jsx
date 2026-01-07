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
import SocketProvider from '../contexts/SocketContext';
import NotificationProvider from '../contexts/NotificationContext';
import PatientVideoConference from '../pages/Patient/features/PatientVideoConference';
import VideoCallProvider from '../contexts/VideoCallContext';

const PatientRoute = (
  <Route
    path="/patient"
    element={
      <ProtectedRoute requiredRole="patient">
        <SocketProvider>
          <NotificationProvider>
            <AuthProvider>
              <AppointmentProvider>
                <ScheduleProvider>
                  <ConditionalLayout />
                </ScheduleProvider>
              </AppointmentProvider>
            </AuthProvider>
          </NotificationProvider>
        </SocketProvider>
      </ProtectedRoute>
    }
  >
    <Route path="complete-registration" element={<RegistrationSteps />} />
    <Route path="my-dashboard" element={<PatientDashboard />} />
    <Route path="my-appointments" element={<PatientAppointment />} />
    <Route path="my-medical-history" element={<PatientMedicalHistory />} />
    <Route
      path="video-call/:roomId?"
      element={
        <VideoCallProvider>
          <PatientVideoConference />
        </VideoCallProvider>
      }
    />
    <Route path="my-details" element={<PatientDetails />} />
    <Route path="my-settings" element={<PatientSettings />} />
  </Route>
);

export default PatientRoute;
