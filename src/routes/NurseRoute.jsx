import { Route } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import ConditionalLayout from '../layouts/ConditionalLayout';
// contexts
import AuthProvider from '../contexts/AuthContext';
import SocketProvider from '../contexts/SocketContext';
import ScheduleProvider from '../contexts/ScheduleContext';
import AppointmentProvider from '../contexts/AppointmentContext';
import NotificationProvider from '../contexts/NotificationContext';
import PatientProvider from '../contexts/PatientContext';
// components

import NurseDashboard from '../pages/Nurse/features/NurseDashboard';
import NurseBedManagement from '../pages/Nurse/features/NurseBedManagement';
import NursePatient from '../pages/Nurse/features/NursePatient';
import NurseERPage from '../pages/Nurse/features/NurseERPage';
// import NurseAppointment from '../pages/Nurse/features/NurseAppointment';
// import NursePatient from '../pages/Nurse/features/NursePatient';

const NurseRoute = (
  <Route
    path="/nurse"
    element={
      <ProtectedRoute requiredRole="nurse">
        <SocketProvider>
          <NotificationProvider>
            <AuthProvider>
              <PatientProvider>
                <AppointmentProvider>
                  <ScheduleProvider>
                    <ConditionalLayout />
                  </ScheduleProvider>
                </AppointmentProvider>
              </PatientProvider>
            </AuthProvider>
          </NotificationProvider>
        </SocketProvider>
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<NurseDashboard />} />
    <Route path="beds" element={<NurseBedManagement />} />
    <Route path="patient-records" element={<NursePatient />} />
    <Route path="er" element={<NurseERPage />} />
    {/* <Route path="appointments" element={<NurseAppointment />} />*/}
  </Route>
);

export default NurseRoute;
