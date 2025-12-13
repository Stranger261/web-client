import React from 'react';
import PageLayout from './layouts/PageLayout';
import AuthProvider from './contexts/AuthContext';
import FaceCapture from './components/Scanner/FaceCapture';
import LandingPage from './pages/LandingPage';
import AppRoutes from './routes';
import ErrorBoundary from './components/shared/errorBoundary';

const App = () => {
  return (
    <>
      <AuthProvider>
        <div className="w-full bg-base-100">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>
      </AuthProvider>
    </>
  );
};

export default App;
