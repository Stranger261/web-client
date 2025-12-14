import { Route } from 'react-router';
import ProtectedRoute from './ProtectedRoute';

import AuthProvider from '../contexts/AuthContext';
import AppointmentProvider from '../contexts/AppointmentContext';
import ScheduleProvider from '../contexts/ScheduleContext';

import DoctorDashboard from '../pages/Doctor/features/DoctorDashboard';
import DoctorAppointments from '../pages/Doctor/features/DoctorAppointments';
import ConditionalLayout from '../layouts/ConditionalLayout';
import PatientAppointment from '../pages/Patient/features/PatientAppointment';

const DoctorRoute = (
  <Route
    path="/doctor"
    element={
      <ProtectedRoute requiredRole="doctor">
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
    <Route path="dashboard" element={<DoctorDashboard />} />
    <Route path="appointments" element={<DoctorAppointments />} />
  </Route>
);

export default DoctorRoute;
