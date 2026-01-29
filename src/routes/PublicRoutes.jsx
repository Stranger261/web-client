import { Route } from 'react-router';
import LoginPage from '../pages/LoginPage';
import LandingPage from '../pages/LandingPage';
import RegisterPage from '../pages/RegisterPage';
import PublicRoute from './PublicRoute';
import VerifyOTPPage from '../pages/Patient/features/VerifyOTPPage';

const PublicRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/verify-otp"
      element={
        <PublicRoute>
          <VerifyOTPPage />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />
  </>
);

export default PublicRoutes;
