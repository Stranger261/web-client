import { useEffect, useState, useMemo, useRef } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';

import LoadingOverlay from '../../components/generic/LoadingOverlay';
import Pagination from '../../components/generic/Pagination';
import PatientModal from '../../components/Modals/PatientModal';

import { LIMIT } from '../../config/CONST';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmationModal';

const ReceptionistPatientRecords = () => {
  const { currentUser } = useAuth();
  const {
    patientDetail,
    getAllPatients,
    searchPatients,
    patients,
    patientsMaxPage,
    isLoading,
    getPatientDetailsById,
    createPatient,
    updatePatientDetail,
    deletePatient,
  } = usePatient();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mode, setMode] = useState(null);
  const [page, setPage] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000); // 1 second delay

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Use useMemo to prevent unnecessary re-computations
  const filters = useMemo(() => {
    const filterObj = {};

    // Handle search query (name or ID) - use debounced version
    if (debouncedSearchQuery.trim()) {
      filterObj.search = debouncedSearchQuery; // Send as "search" parameter
    }

    // Handle status filter
    if (statusFilter === 'active') {
      filterObj.isDeleted = 'false'; // Send as string for URL params
    } else if (statusFilter === 'inactive') {
      filterObj.isDeleted = 'true';
    }

    // Handle gender filter
    if (genderFilter) {
      filterObj.gender = genderFilter;
    }

    return filterObj;
  }, [debouncedSearchQuery, statusFilter, genderFilter]);

  // Determine if we need to use search or regular fetch
  const hasFilters = Boolean(
    debouncedSearchQuery || statusFilter || genderFilter
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, statusFilter, genderFilter]);

  // Fetch data when page changes or when filters change (and page is reset to 1)
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (hasFilters) {
          await searchPatients(page, LIMIT, filters);
        } else {
          await getAllPatients(page, LIMIT);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchData();
  }, [page, hasFilters, filters, getAllPatients, searchPatients]);

  const openModal = async (mode, id) => {
    if (mode === 'view' || mode === 'edit') {
      await getPatientDetailsById(id);
      setMode(mode);
    }

    if (mode === 'create') {
      setMode(mode);
    }

    if (mode === 'delete') {
      setIsDeleteOpen(true);
      setDeleteTarget(id);
    }
  };

  const submitHandler = async (mode, data, id) => {
    setIsSubmitting(true);
    try {
      const apiCallPromise =
        mode === 'create' ? createPatient(data) : updatePatientDetail(id, data);

      const delayPromise = new Promise(resolve => setTimeout(resolve, 900));

      const [apiResponse] = await Promise.all([apiCallPromise, delayPromise]);

      if (!apiResponse.data?.success) {
        throw new Error(
          apiResponse.data?.message ||
            `Failed to ${mode === 'create' ? 'create' : 'update'} details.`
        );
      }

      toast.success(
        `Patient ${mode === 'create' ? 'created' : 'updated'} successfully.`
      );

      setMode(null);
      await getAllPatients(page, LIMIT);
      return apiResponse;
    } catch (error) {
      console.error('❌ Submit error:', error);
      await new Promise(res => setTimeout(res, 900));
      const message =
        error?.response?.data?.message ||
        error.message ||
        `Failed to ${mode === 'create' ? 'create' : 'update'} patient.`;
      toast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteHandler = async id => {
    setIsSubmitting(true);
    try {
      const deletedPatient = await deletePatient(id);

      if (!deletedPatient) return toast.error('Deletion failed.');

      toast.success(
        deletePatient.message || `Patient ${id} Deleted successfully`
      );

      await getAllPatients();
    } catch (error) {
      toast.error(
        error.data.data.message ||
          error.data.message ||
          'Deleting patient failed.'
      );
    } finally {
      setIsSubmitting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-base-100">
        {mode && (
          <PatientModal
            mode={mode}
            patient={patientDetail}
            isSubmitting={isSubmitting}
            onClose={() => setMode(null)}
            onSubmit={submitHandler}
          />
        )}

        {isDeleteOpen && (
          <DeleteConfirmModal
            isOpen={isDeleteOpen}
            isSubmitting={isSubmitting}
            onClose={() => setIsDeleteOpen(false)} // ✅ wrap in function
            onConfirm={() => deleteHandler(deleteTarget)} // ✅ pass deleteTarget
            itemName={deleteTarget}
          />
        )}
        {/* Header */}
        <header className="flex items-center justify-between px-16 py-4 border-b bg-base-100 border-base-300 shadow">
          <h1 className="text-2xl font-bold text-base-content">
            Patient Records
          </h1>
          <button
            onClick={() => openModal('create')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            + New Patient
          </button>
        </header>

        {/* Main content area */}
        <main className="flex-1 flex flex-col p-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            {/* Search */}
            <div className="flex items-center w-full sm:w-1/3">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                />
                {/* Show loading indicator while typing */}
                {searchQuery !== debouncedSearchQuery &&
                  searchQuery.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    </div>
                  )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg shadow-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg shadow-sm"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex-1 border rounded-xl overflow-hidden flex flex-col">
            {/* Table */}
            {isLoading ? (
              <LoadingOverlay />
            ) : (
              <div className="overflow-x-auto bg-base-100 shadow rounded-lg">
                <table className="min-w-full table-auto divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.length > 0 ? (
                      patients.map(patient => (
                        <tr
                          key={patient._id}
                          className="hover:bg-gray-50 transition cursor-pointer"
                        >
                          {/* Name */}
                          <td className="px-4 py-3 whitespace-normal break-words max-w-[200px]">
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {`${patient.firstname} ${
                                  patient.middlename || ''
                                } ${patient.lastname}`.trim()}
                              </div>
                            </div>
                          </td>

                          {/* Gender */}
                          <td className="px-4 py-3 whitespace-normal break-words max-w-[200px] capitalize text-gray-700">
                            {patient.gender}
                          </td>

                          {/* Age */}
                          <td className="px-4 py-3 whitespace-normal break-words max-w-[200px] text-gray-700">
                            {patient.age}
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3 whitespace-normal break-words max-w-[200px] text-gray-700">
                            {patient.phone}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 whitespace-normal break-words max-w-[200px] font-medium">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                !patient.isDeleted
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {!patient.isDeleted ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 whitespace-normal break-words max-w-[200px] text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => openModal('view', patient._id)}
                                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => openModal('edit', patient._id)}
                                className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openModal('delete', patient._id)}
                                disabled={patient.isDeleted}
                                className={`p-2 rounded-lg transition flex items-center gap-1 ${
                                  patient.isDeleted
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed line-through'
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center text-gray-500 text-sm"
                        >
                          <div className="flex flex-col items-center">
                            <div className="text-4xl text-gray-300 mb-2">
                              👤
                            </div>
                            <div>No patients found.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                page={page}
                maxPage={patientsMaxPage || 1}
                onPageChange={setPage}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ReceptionistPatientRecords;
