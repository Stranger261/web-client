// AppRoutes.jsx - Add console.log to debug
import { Routes } from 'react-router';
import PublicRoutes from './PublicRoutes';
import PatientRoute from './PatientRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {PatientRoute}
      {PublicRoutes}
    </Routes>
  );
};

export default AppRoutes;
