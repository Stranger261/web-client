// AppRoutes.jsx - Add console.log to debug
import { Routes } from 'react-router';
import PublicRoutes from './PublicRoutes';
import PatientRoute from './PatientRoute';
import DoctorRoute from './DoctorRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {DoctorRoute}
      {PatientRoute}
      {PublicRoutes}
    </Routes>
  );
};

export default AppRoutes;
