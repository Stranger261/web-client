import { Route } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
// contexts
import AuthProvider from '../contexts/AuthContext';
import SocketProvider from '../contexts/SocketContext';
import ScheduleProvider from '../contexts/ScheduleContext';
import AppointmentProvider from '../contexts/AppointmentContext';
import ConditionalLayout from '../layouts/ConditionalLayout';
// components
import ReceptionistDashboard from '../pages/Receptionist/features/ReceptionistDashboard';
import NotificationProvider from '../contexts/NotificationContext';

const ReceptionistRoute = (
  <Route
    path="/receptionist"
    element={
      <ProtectedRoute requiredRole="receptionist">
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
    <Route path="dashboard" element={<ReceptionistDashboard />} />
  </Route>
);

export default ReceptionistRoute;
