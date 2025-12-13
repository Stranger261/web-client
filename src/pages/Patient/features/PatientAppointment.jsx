// File: /src/pages/PatientPages/features/PatientAppointment.jsx
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { useAppointment } from '../../../contexts/AppointmentContext';
import { Filter, Plus, X, Calendar, Search } from 'lucide-react';

import LoadingOverlay from '../../../components/shared/LoadingOverlay';
import { Button } from '../../../components/ui/button';

import AppointmentsTable from '../../../components/shared/AppointmentsTable';
import CreateAppointment from '../components/Appointment/CreateAppointment';
import Modal from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/pagination';
import { Select } from '../../../components/ui/select';
import AppointmentDetailModal from '../components/Appointment/AppointmentDetailModal';

const PatientAppointment = () => {
  const { currentUser } = useAuth();
  const { isLoading, appointments, pagination, getPatientAppointments } =
    useAppointment();

  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [filters, setFilters] = useState({
    status: '',
    from_date: '',
    to_date: '',
    appointment_type: '',
  });

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== ''
  ).length;

  // ===== Pagination handlers =====
  const handlePageChange = (currentPage, movement) => {
    const totalPages = pagination.totalPages;
    let newPage = currentPage;
    if (currentPage < totalPages && movement === 'next') {
      newPage++;
    } else if (currentPage !== totalPages && movement === 'last') {
      newPage = totalPages;
    } else if (currentPage !== 1 && movement === 'prev') {
      newPage--;
    } else if (currentPage !== 1 && movement === 'first') {
      newPage = 1;
    }

    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = useCallback(newLimit => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  // ===== Filter handlers =====
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      from_date: '',
      to_date: '',
      appointment_type: '',
    });
    setCurrentPage(1);
  };

  const viewAppointment = appt => {
    console.log(appt);
    setSelectedAppt(appt);
    setShowDetails(true);
  };

  // ===== Fetch data on filter/page changes =====
  useEffect(() => {
    const apiFilter = {
      page: currentPage,
      limit,
      // Only include filters that have values
      ...(filters.status && { status: filters.status }),
      ...(filters.appointment_type && {
        appointment_type: filters.appointment_type,
      }),
      ...(filters.from_date && { from_date: filters.from_date }),
      ...(filters.to_date && { to_date: filters.to_date }),
    };

    getPatientAppointments(currentUser.patient.patient_uuid, apiFilter);
  }, [getPatientAppointments, currentUser, filters, currentPage, limit]);

  return (
    // <div className="space-y-6">
    //   <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
    //     <div className="flex items-center justify-between mr-4 px-6 py-4">
    //       <div>
    //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    //           My Appointments
    //         </h1>
    //         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
    //           Manage and track your medical appointments
    //         </p>
    //       </div>

    //       <div className="flex gap-3">
    //         <Button
    //           variant="outline"
    //           icon={Filter}
    //           onClick={() => setShowFilters(!showFilters)}
    //         >
    //           Filters
    //           {activeFiltersCount > 0 && (
    //             <span className="ml-1 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
    //               {activeFiltersCount}
    //             </span>
    //           )}
    //         </Button>

    //         {/* New Appointment Button */}
    //         <Button
    //           variant="create"
    //           icon={Plus}
    //           onClick={() => setShowCreate(true)}
    //         >
    //           New Appointment
    //         </Button>
    //       </div>
    //     </div>

    //     {showFilters && (
    //       <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
    //         <div className="flex items-center justify-between mb-4">
    //           <div className="flex items-center gap-2">
    //             <Search className="text-blue-600" size={18} />
    //             <h3 className="text-base font-semibold text-gray-900 dark:text-white">
    //               Filter Appointments
    //             </h3>
    //           </div>
    //           <button
    //             onClick={() => setShowFilters(false)}
    //             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
    //           >
    //             <X size={18} />
    //           </button>
    //         </div>

    //         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    //           {/* Status Filter */}
    //           <Select
    //             label="Appointment Status"
    //             name="status"
    //             value={filters.status}
    //             onChange={handleFilterChange}
    //             options={[
    //               { value: 'scheduled', label: 'Scheduled' },
    //               { value: 'confirmed', label: 'Confirmed' },
    //               { value: 'completed', label: 'Completed' },
    //               { value: 'cancelled', label: 'Cancelled' },
    //               { value: 'rescheduled', label: 'Rescheduled' },
    //             ]}
    //           />

    //           <Select
    //             label="Appointment type"
    //             name="appointment_type"
    //             value={filters.appointment_type}
    //             onChange={handleFilterChange}
    //             options={[
    //               { value: 'consultation', label: 'Consultation' },
    //               { value: 'followup', label: 'Follow-up' },
    //               { value: 'procedure', label: 'Procedure' },
    //               { value: 'checkup', label: 'Check-up' },
    //             ]}
    //           />

    //           {/* From Date Filter */}
    //           <div className="space-y-2">
    //             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    //               From Date
    //             </label>
    //             <div className="relative">
    //               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
    //                 <Calendar size={16} className="text-gray-400" />
    //               </div>
    //               <input
    //                 type="date"
    //                 name="from_date"
    //                 value={filters.from_date}
    //                 onChange={handleFilterChange}
    //                 className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-[18px]"
    //               />
    //             </div>
    //           </div>

    //           {/* To Date Filter */}
    //           <div className="space-y-2">
    //             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    //               To Date
    //             </label>
    //             <div className="relative">
    //               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
    //                 <Calendar size={16} className="text-gray-400" />
    //               </div>
    //               <input
    //                 type="date"
    //                 name="to_date"
    //                 value={filters.to_date}
    //                 onChange={handleFilterChange}
    //                 className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-[18px]"
    //               />
    //             </div>
    //           </div>

    //           {/* Clear Button */}
    //           <div className="flex items-end">
    //             <Button
    //               variant="outline"
    //               onClick={handleClearFilters}
    //               disabled={activeFiltersCount === 0}
    //             >
    //               <X size={16} className="mr-1" />
    //               Clear All
    //             </Button>
    //           </div>
    //         </div>

    //         {/* Active Filters Pills */}
    //         {activeFiltersCount > 0 && (
    //           <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
    //             <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
    //               Active:
    //             </span>
    //             {filters.status && (
    //               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800">
    //                 Status: {filters.status}
    //                 <button
    //                   onClick={() =>
    //                     handleFilterChange({
    //                       target: { name: 'status', value: '' },
    //                     })
    //                   }
    //                   className="hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-sm p-0.5"
    //                 >
    //                   <X size={12} />
    //                 </button>
    //               </span>
    //             )}
    //             {filters.appointment_type && (
    //               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium border border-green-200 dark:border-green-800">
    //                 Type: {filters.appointment_type}
    //                 <button
    //                   onClick={() =>
    //                     handleFilterChange({
    //                       target: { name: 'appointment_type', value: '' },
    //                     })
    //                   }
    //                   className="hover:bg-green-100 dark:hover:bg-green-900/50 rounded-sm p-0.5"
    //                 >
    //                   <X size={12} />
    //                 </button>
    //               </span>
    //             )}
    //             {filters.from_date && (
    //               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium border border-green-200 dark:border-green-800">
    //                 From: {filters.from_date}
    //                 <button
    //                   onClick={() =>
    //                     handleFilterChange({
    //                       target: { name: 'from_date', value: '' },
    //                     })
    //                   }
    //                   className="hover:bg-green-100 dark:hover:bg-green-900/50 rounded-sm p-0.5"
    //                 >
    //                   <X size={12} />
    //                 </button>
    //               </span>
    //             )}
    //             {filters.to_date && (
    //               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium border border-purple-200 dark:border-purple-800">
    //                 To: {filters.to_date}
    //                 <button
    //                   onClick={() =>
    //                     handleFilterChange({
    //                       target: { name: 'to_date', value: '' },
    //                     })
    //                   }
    //                   className="hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-sm p-0.5"
    //                 >
    //                   <X size={12} />
    //                 </button>
    //               </span>
    //             )}
    //           </div>
    //         )}
    //       </div>
    //     )}
    //   </header>

    //   <div className="py-4">
    //     {isLoading ? (
    //       <LoadingOverlay />
    //     ) : (
    //       <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
    //         {appointments.length > 0 ? (
    //           <>
    //             <AppointmentsTable
    //               currentUser={currentUser}
    //               appointments={appointments}
    //               showColumns={[
    //                 'person',
    //                 'date',
    //                 'time',
    //                 'status',
    //                 'appointment_type',
    //                 'actions',
    //               ]}
    //               onViewDetails={viewAppointment}
    //             />

    //             <Pagination
    //               currentPage={currentPage}
    //               totalPages={pagination.totalPages}
    //               totalItems={pagination.total}
    //               itemsPerPage={limit}
    //               onPageChange={handlePageChange}
    //               onItemsPerPageChange={handleItemsPerPageChange}
    //             />
    //           </>
    //         ) : (
    //           /* Empty State */
    //           <div className="p-16 text-center">
    //             <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
    //               <Calendar size={32} className="text-gray-400" />
    //             </div>
    //             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
    //               No appointments found
    //             </h3>
    //             <p className="text-gray-500 dark:text-gray-400 mb-6">
    //               {activeFiltersCount > 0
    //                 ? 'Try adjusting your filters to see more results'
    //                 : "You don't have any appointments yet. Create your first one!"}
    //             </p>
    //             {activeFiltersCount > 0 ? (
    //               <Button variant="outline" onClick={handleClearFilters}>
    //                 Clear Filters
    //               </Button>
    //             ) : (
    //               <Button
    //                 variant="create"
    //                 icon={Plus}
    //                 onClick={() => setShowCreate(true)}
    //               >
    //                 Schedule Appointment
    //               </Button>
    //             )}
    //           </div>
    //         )}
    //       </div>
    //     )}
    //   </div>

    //   <Modal
    //     isOpen={showCreate}
    //     onClose={() => setShowCreate(false)}
    //     title="Create Appointment"
    //   >
    //     <CreateAppointment onClose={() => setShowCreate(false)} />
    //   </Modal>

    //   <Modal
    //     isOpen={showDetails}
    //     onClose={() => setShowDetails(false)}
    //     title="Appointment details"
    //   >
    //     <AppointmentDetailModal
    //       isOpen={showDetails}
    //       onClose={() => setShowDetails(false)}
    //       appointment={selectedAppt}
    //     />
    //   </Modal>
    // </div>
    <div className="space-y-6"></div>
  );
};

export default PatientAppointment;
