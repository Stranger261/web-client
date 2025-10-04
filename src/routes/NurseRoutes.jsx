import { Route } from 'react-router';

import ProtectedRoutes from './ProtectedRoutes';

import AuthProvider from '../context/AuthContext';
import ScheduleProvider from '../context/ScheduleContext';
import AppointmentProvider from '../context/AppointmentContext';
import PatientProvider from '../context/PatientContext';
import NurseLayout from '../layouts/NurseLayout';

import { SettingsProvider } from '../context/SettingsContext';

import NurseDashboard from '../pages/NursePage/NurseDashboard';
import NurseAppointments from '../pages/NursePage/NurseAppointments';
import NursePatientRecords from '../pages/NursePage/NursePatientRecords';
import NurseMedicalRecords from '../pages/NursePage/NurseMedicalRecords';
import NurseAssistance from '../pages/NursePage/NurseAssistance';
import NurseSettings from '../pages/NursePage/NurseSettings';
import NurseReports from '../pages/NursePage/NurseReports';
import NurseBedManagement from '../pages/NursePage/NurseBedManagement';

const NurseRoutes = (
  <Route
    path={'/nurse'}
    element={
      <ProtectedRoutes requiredRole="nurse">
        <AuthProvider>
          <ScheduleProvider>
            <AppointmentProvider>
              <PatientProvider>
                <SettingsProvider>
                  <NurseLayout />
                </SettingsProvider>
              </PatientProvider>
            </AppointmentProvider>
          </ScheduleProvider>
        </AuthProvider>
      </ProtectedRoutes>
    }
  >
    <Route path="dashboard" element={<NurseDashboard />} />
    <Route path="appointments" element={<NurseAppointments />} />
    <Route path="patient-records" element={<NursePatientRecords />} />
    <Route path="beds" element={<NurseBedManagement />} />
    <Route path="medical-records" element={<NurseMedicalRecords />} />
    <Route path="assistance" element={<NurseAssistance />} />
    <Route path="reports" element={<NurseReports />} />
    <Route path="settings" element={<NurseSettings />} />
  </Route>
);

export default NurseRoutes;
