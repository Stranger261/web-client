import React from 'react';
import PageLayout from './layouts/PageLayout';
import AuthProvider from './contexts/AuthContext';
import FaceCapture from './components/Scanner/FaceCapture';
import LandingPage from './pages/LandingPage';

const App = () => {
  return (
    <>
      <AuthProvider>
        <div className="w-full bg-base-100">
          {/* <PageLayout /> */}
          <LandingPage />
        </div>
      </AuthProvider>
      {/* <FaceCapture /> */}
    </>
  );
};

export default App;
