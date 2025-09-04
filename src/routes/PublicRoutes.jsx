import { Route } from 'react-router';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/AuthPage/LoginPage';
import RegisterPage from '../pages/AuthPage/RegistrationPage';

const PublicRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </>
);

export default PublicRoutes;
