import { Routes } from 'react-router';
import PublicRoutes from './PublicRoutes';
import UserRoutes from './UserRoutes';
import ReceptionistRoutes from './ReceptionistRoutes';
import DoctorRoutes from './DoctorRoutes';
import AdminRoutes from './AdminRoutes';
import NurseRoutes from './NurseRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {PublicRoutes}
      {UserRoutes}
      {ReceptionistRoutes}
      {DoctorRoutes}
      {AdminRoutes}
      {NurseRoutes}
    </Routes>
  );
};
export default AppRoutes;
