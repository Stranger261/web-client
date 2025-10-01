import { Route } from 'react-router';
import ProtectedRoutes from './ProtectedRoutes';
import ReceptionistDashboard from '../pages/ReceptionistPage/ReceptionistDashboard';
import ReceptionistLayout from '../layouts/ReceptionistLayout';
import ReceptionistPatientRecords from '../pages/ReceptionistPage/ReceptionistPatientRecords';
import AuthProvider from '../context/AuthContext';
import ScheduleProvider from '../context/ScheduleContext';
import AppointmentProvider from '../context/AppointmentContext';
import PatientProvider from '../context/PatientContext';
import ReceptionistAppointments from '../pages/ReceptionistPage/ReceptionistAppointments';
import ReceptionistReports from '../pages/ReceptionistPage/ReceptionistReports';
import ReceptionistBilling from '../pages/ReceptionistPage/ReceptionistBilling';
import ReceptionistSettings from '../pages/ReceptionistPage/ReceptionistSettings';
import { SettingsProvider } from '../context/SettingsContext';

const ReceptionistRoutes = (
  <Route
    path="/receptionist"
    element={
      <ProtectedRoutes requiredRole="receptionist">
        <AuthProvider>
          <ScheduleProvider>
            <AppointmentProvider>
              <PatientProvider>
                <SettingsProvider>
                  <ReceptionistLayout />
                </SettingsProvider>
              </PatientProvider>
            </AppointmentProvider>
          </ScheduleProvider>
        </AuthProvider>
      </ProtectedRoutes>
    }
  >
    <Route path="dashboard" element={<ReceptionistDashboard />} />
    <Route path="patient-records" element={<ReceptionistPatientRecords />} />
    <Route path="appointments" element={<ReceptionistAppointments />} />
    <Route path="billing" element={<ReceptionistBilling />} />
    <Route path="reports" element={<ReceptionistReports />} />
    <Route path="settings" element={<ReceptionistSettings />} />
  </Route>
);

export default ReceptionistRoutes;
