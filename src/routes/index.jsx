// AppRoutes.jsx - Add console.log to debug
import { Routes, Route } from 'react-router';
import PublicRoutes from './PublicRoutes';
import PatientRoute from './PatientRoute';
import DoctorRoute from './DoctorRoute';
import ReceptionistRoute from './ReceptionistRoute';
import NurseRoute from './NurseRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {NurseRoute}
      {ReceptionistRoute}
      {DoctorRoute}
      {PatientRoute}
      {PublicRoutes}
    </Routes>
  );
};

export default AppRoutes;
