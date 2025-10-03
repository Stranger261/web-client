import { Route } from 'react-router';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/AuthPage/LoginPage';
import RegisterPage from '../pages/AuthPage/RegistrationPage';
import ScheduleProvider from '../context/ScheduleContext';

const PublicRoutes = (
  <>
    <Route
      path="/"
      element={
        <ScheduleProvider>
          <LandingPage />
        </ScheduleProvider>
      }
    />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/login" element={<LoginPage />} />
  </>
);

export default PublicRoutes;
