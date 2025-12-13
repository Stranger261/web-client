import { Route } from 'react-router';
import ProtectedRoute from './ProtectedRoute';

import AuthProvider from '../contexts/AuthContext';
import AppointmentProvider from '../contexts/AppointmentContext';
import ScheduleProvider from '../contexts/ScheduleContext';

import BaseLayout from '../layouts/BaseLayout';

import DoctorDashboard from '../pages/Doctor/features/DoctorDashboard';
import DoctorAppointments from '../pages/Doctor/features/DoctorAppointments';

const DoctorRoute = (
  <Route
    path="/doctor"
    element={
      <ProtectedRoute requiredRole="doctor">
        <AuthProvider>
          <AppointmentProvider>
            <ScheduleProvider>
              <BaseLayout />
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
