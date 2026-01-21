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

import ReceptionistDashboard from '../pages/Receptionist/features/ReceptionistDashboard';
import ReceptionistAppointment from '../pages/Receptionist/features/ReceptionistAppointment';
import ReceptionistPatient from '../pages/Receptionist/features/ReceptionistPatient';

const ReceptionistRoute = (
  <Route
    path="/receptionist"
    element={
      <ProtectedRoute requiredRole="receptionist">
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
    <Route path="dashboard" element={<ReceptionistDashboard />} />
    <Route path="appointments" element={<ReceptionistAppointment />} />
    <Route path="patient-records" element={<ReceptionistPatient />} />
  </Route>
);

export default ReceptionistRoute;
