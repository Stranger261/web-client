import AuthProvider from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AppRoutes from './routes';

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
