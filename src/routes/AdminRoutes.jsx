import { Route } from 'react-router';

import ProtectedRoutes from './ProtectedRoutes';

import AuthProvider from '../context/AuthContext';
import ScheduleProvider from '../context/ScheduleContext';
import AppointmentProvider from '../context/AppointmentContext';
import PatientProvider from '../context/PatientContext';
import AdminLayout from '../layouts/AdminLayout';

import { SettingsProvider } from '../context/SettingsContext';
import AdminDashboard from '../pages/AdminPage/AdminDashboard';
import AdminUserManagement from '../pages/AdminPage/AdminUserManagement';
import AdminAppointment from '../pages/AdminPage/AdminAppointment';
import AdminMedicalRecords from '../pages/AdminPage/AdminMedicalRecords';
import AdminBilling from '../pages/AdminPage/AdminBilling';
import AdminReports from '../pages/AdminPage/AdminReports';
import AdminSystemSettings from '../pages/AdminPage/AdminSystemSettings';
import AdminSettings from '../pages/AdminPage/AdminSettings';
import AdminBeds from '../pages/AdminPage/AdminBeds';

const AdminRoutes = (
  <Route
    path={'/admin'}
    element={
      <ProtectedRoutes requiredRole="admin">
        <AuthProvider>
          <ScheduleProvider>
            <AppointmentProvider>
              <PatientProvider>
                <SettingsProvider>
                  <AdminLayout />
                </SettingsProvider>
              </PatientProvider>
            </AppointmentProvider>
          </ScheduleProvider>
        </AuthProvider>
      </ProtectedRoutes>
    }
  >
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<AdminUserManagement />} />
    <Route path="appointments" element={<AdminAppointment />} />
    <Route path="medical-records" element={<AdminMedicalRecords />} />
    <Route path="beds" element={<AdminBeds />} />
    <Route path="billing" element={<AdminBilling />} />
    <Route path="reports" element={<AdminReports />} />
    <Route path="system-settings" element={<AdminSystemSettings />} />
    <Route path="settings" element={<AdminSettings />} />
  </Route>
);

export default AdminRoutes;
