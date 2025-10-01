import { Route } from 'react-router';

import AuthProvider from '../context/AuthContext';

import ProtectedRoutes from './ProtectedRoutes';
import UserLayout from '../layouts/UseLayout';

import PatientDashboard from '../pages/PatientPage/PatientDashboard';
import PatientSettings from '../pages/PatientPage/PatientSettings';
import PatientUserDetails from '../pages/PatientPage/PatientUserDetails';
import PatientAppointments from '../pages/PatientPage/PatientAppointments';
import { SettingsProvider } from '../context/SettingsContext';
import ScheduleProvider from '../context/ScheduleContext';
import AppointmentProvider from '../context/AppointmentContext';

const UserRoutes = (
  <Route
    path="/patient"
    element={
      <ProtectedRoutes requiredRole="patient">
        <AuthProvider>
          <SettingsProvider>
            <ScheduleProvider>
              <AppointmentProvider>
                <UserLayout />
              </AppointmentProvider>
            </ScheduleProvider>
          </SettingsProvider>
        </AuthProvider>
      </ProtectedRoutes>
    }
  >
    <Route path="my-dashboard" element={<PatientDashboard />} />
    <Route path="create-appointments" element={<PatientAppointments />} />
    <Route path="my-details" element={<PatientUserDetails />} />
    <Route path="my-settings" element={<PatientSettings />} />
  </Route>
);

export default UserRoutes;
