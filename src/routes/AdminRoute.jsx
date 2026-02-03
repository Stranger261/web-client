import { Route } from 'react-router';
import ProtectedRoute from './ProtectedRoute';

import AuthProvider from '../contexts/AuthContext';
import AppointmentProvider from '../contexts/AppointmentContext';
import ScheduleProvider from '../contexts/ScheduleContext';
import SocketProvider from '../contexts/SocketContext';
import PatientProvider from '../contexts/PatientContext';

import ConditionalLayout from '../layouts/ConditionalLayout';
import NotificationProvider from '../contexts/NotificationContext';
import AdminDashboard from '../pages/Admin/features/AdminDashboard';
import AdminAppointments from '../pages/Admin/features/AdminAppointments';
import AdminPatient from '../pages/Admin/features/AdminPatient';
import AdminBedManagement from '../pages/Admin/features/AdminBedManagement';
import AdminTelehealth from '../pages/Admin/features/AdminTelehealth';
import AdminERAndTriage from '../pages/Admin/features/AdminERAndTriage';

const AdminRoute = (
  <Route
    path="/admin"
    element={
      <ProtectedRoute requiredRole="admin">
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
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="appointments" element={<AdminAppointments />} />
    <Route path="patients" element={<AdminPatient />} />
    <Route path="bed-management" element={<AdminBedManagement />} />
    <Route path="telehealth" element={<AdminTelehealth />} />
    <Route path="er&triage" element={<AdminERAndTriage />} />
  </Route>
);

export default AdminRoute;
