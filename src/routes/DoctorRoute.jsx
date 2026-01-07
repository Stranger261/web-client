import { Route } from 'react-router';
import ProtectedRoute from './ProtectedRoute';

import AuthProvider from '../contexts/AuthContext';
import AppointmentProvider from '../contexts/AppointmentContext';
import ScheduleProvider from '../contexts/ScheduleContext';
import SocketProvider from '../contexts/SocketContext';

import DoctorDashboard from '../pages/Doctor/features/DoctorDashboard';
import DoctorAppointments from '../pages/Doctor/features/DoctorAppointments';
import ConditionalLayout from '../layouts/ConditionalLayout';
import NotificationProvider from '../contexts/NotificationContext';
import DoctorPatients from '../pages/Doctor/features/DoctorPatients';
import PatientProvider from '../contexts/PatientContext';
import DoctorVideoCall from '../pages/Doctor/features/DoctorVideoCall';
import VideoCallProvider from '../contexts/VideoCallContext';

const DoctorRoute = (
  <Route
    path="/doctor"
    element={
      <ProtectedRoute requiredRole="doctor">
        <SocketProvider>
          <NotificationProvider>
            <AuthProvider>
              <AppointmentProvider>
                <ScheduleProvider>
                  <PatientProvider>
                    <ConditionalLayout />
                  </PatientProvider>
                </ScheduleProvider>
              </AppointmentProvider>
            </AuthProvider>
          </NotificationProvider>
        </SocketProvider>
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<DoctorDashboard />} />
    <Route path="appointments" element={<DoctorAppointments />} />
    <Route path="my-patients" element={<DoctorPatients />} />
    <Route
      path="video-call/:roomId?"
      element={
        <VideoCallProvider>
          <DoctorVideoCall />
        </VideoCallProvider>
      }
    />
  </Route>
);

export default DoctorRoute;
