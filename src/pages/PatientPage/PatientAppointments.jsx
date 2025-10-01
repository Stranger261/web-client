import { useState } from 'react';
import { useAppointments } from '../../context/AppointmentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingOverlay from '../../components/generic/LoadingOverlay.jsx';
import Pagination from '../../components/generic/Pagination.jsx';
import { UnverifiedUserStatus } from '../../components/generic/Warning.jsx';

import Modal from '../../components/Modals/AppointmentModal.jsx';

import AppointmentsTable from '../../components/appointments/AppointmentTables';
import AppointmentDetails from '../../components/appointments/AppointmentDetails';
import CreateAppointment from './CreateAppointment.jsx';

const PatientAppointments = () => {
  const { currentUser } = useAuth();
  const { myAppointments, isLoading } = useAppointments();

  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [changing, setChanging] = useState(false);
  const maxPage = Math.ceil(myAppointments.length / 10);
  const pageItem = myAppointments.slice((page - 1) * 10, page * 10);

  const handlePageChange = newPage => {
    if (newPage < 1 || newPage > maxPage) return;
    setChanging(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setPage(newPage);
      setChanging(false);
    }, 290);
  };

  if (isLoading) return <LoadingOverlay />;
  if (!currentUser.isVerified) return <UnverifiedUserStatus />;

  return (
    <div className="bg-white min-h-screen">
      <header className="flex items-center justify-between px-16 py-4 border-b bg-base-100 border-base-300 shadow">
        <h1 className="text-2xl font-bold text-base-content">
          My Appointments
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          + New Appointment
        </button>
      </header>

      {isLoading || myAppointments.length === 0 ? (
        <LoadingOverlay />
      ) : (
        <div className="p-6 bg-white min-h-screen">
          <AppointmentsTable
            appointments={myAppointments}
            currentUser={currentUser}
            pageItem={pageItem}
            changing={changing}
            onViewDetails={appt => {
              setSelectedAppt(appt);
              setShowDetails(true);
            }}
            showColumns={['person', 'date', 'time', 'status', 'actions']}
          />

          <Pagination
            page={page}
            maxPage={maxPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Appointment Details"
      >
        <AppointmentDetails
          appointment={selectedAppt}
          currentUser={currentUser}
          showFields={[
            'doctor',
            'date',
            'time',
            'status',
            'reason',
            'followUp',
          ]}
        />
      </Modal>

      {/* Create Appointment */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Appointment"
      >
        <CreateAppointment />
      </Modal>
    </div>
  );
};

export default PatientAppointments;
