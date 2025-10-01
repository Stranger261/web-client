import { Toaster } from 'react-hot-toast';
import AuthProvider from './context/AuthContext';
import AppRoutes from './routes';

const App = () => {
  return (
    <>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
