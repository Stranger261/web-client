import { Route } from 'react-router';

import ProtectedRoutes from './ProtectedRoutes';

import AuthProvider from '../context/AuthContext';
import ScheduleProvider from '../context/ScheduleContext';
import AppointmentProvider from '../context/AppointmentContext';
import PatientProvider from '../context/PatientContext';
import DoctorLayout from '../layouts/DoctorLayout';
import DoctorDashboard from '../pages/DoctorPage/DoctorDashboard';
import { SettingsProvider } from '../context/SettingsContext';

import DoctorMedicalRecords from '../pages/DoctorPage/DoctorMedicalRecords';
import DoctorAppointments from '../pages/DoctorPage/DoctorAppointments';
import DoctorPatients from '../pages/DoctorPage/DoctorPatients';
import DoctorReports from '../pages/DoctorPage/DoctorReports';
import DoctorSettings from '../pages/DoctorPage/DoctorSettings';

const DoctorRoutes = (
  <Route
    path={'/doctor'}
    element={
      <ProtectedRoutes requiredRole="doctor">
        <AuthProvider>
          <ScheduleProvider>
            <AppointmentProvider>
              <PatientProvider>
                <SettingsProvider>
                  <DoctorLayout />
                </SettingsProvider>
              </PatientProvider>
            </AppointmentProvider>
          </ScheduleProvider>
        </AuthProvider>
      </ProtectedRoutes>
    }
  >
    <Route path="dashboard" element={<DoctorDashboard />} />
    <Route path="medical-records" element={<DoctorMedicalRecords />} />
    <Route path="appointments" element={<DoctorAppointments />} />
    <Route path="my-patients" element={<DoctorPatients />} />
    <Route path="reports" element={<DoctorReports />} />
    <Route path="settings" element={<DoctorSettings />} />
  </Route>
);

export default DoctorRoutes;
