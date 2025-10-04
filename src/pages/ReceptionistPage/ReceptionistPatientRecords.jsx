import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';

import LoadingOverlay from '../../components/generic/LoadingOverlay';
import Pagination from '../../components/generic/Pagination';
import PatientModal from '../../components/Modals/PatientModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmationModal';
import StatsCard from '../../components/Card/StatsCard';

import { LIMIT } from '../../config/CONST';

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
    patientStats, // Get stats from context
    getPatientStats, // Get stats method from context
  } = usePatient();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mode, setMode] = useState(null);
  const [page, setPage] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Fetch statistics on component mount
  useEffect(() => {
    getPatientStats();
  }, []); // Fetch once on mount

  // Refetch stats after CRUD operations
  const refreshStats = async () => {
    try {
      await getPatientStats();
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Use useMemo to prevent unnecessary re-computations
  const filters = useMemo(() => {
    const filterObj = {};

    if (debouncedSearchQuery.trim()) {
      filterObj.search = debouncedSearchQuery;
    }

    if (statusFilter === 'active') {
      filterObj.isDeleted = 'false';
    } else if (statusFilter === 'inactive') {
      filterObj.isDeleted = 'true';
    }

    if (genderFilter) {
      filterObj.gender = genderFilter;
    }

    if (bloodTypeFilter) {
      filterObj.bloodType = bloodTypeFilter;
    }

    return filterObj;
  }, [debouncedSearchQuery, statusFilter, genderFilter, bloodTypeFilter]);

  const hasFilters = Boolean(
    debouncedSearchQuery || statusFilter || genderFilter || bloodTypeFilter
  );

  const hasActiveFilters =
    debouncedSearchQuery ||
    statusFilter !== 'active' ||
    genderFilter ||
    bloodTypeFilter;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, statusFilter, genderFilter, bloodTypeFilter]);

  // Fetch data when page changes or when filters change
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
      await refreshStats(); // Refresh stats after create/update
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
      await refreshStats(); // Refresh stats after delete
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

  const handleRefresh = async () => {
    try {
      await getAllPatients(page, LIMIT);
      await refreshStats();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const handleExport = () => {
    toast.success('Export functionality coming soon');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setStatusFilter('active');
    setGenderFilter('');
    setBloodTypeFilter('');
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
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
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => deleteHandler(deleteTarget)}
            itemName={deleteTarget}
          />
        )}

        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Patient Records
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and view patient information
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Download size={18} />
                  Export
                </button>
                <button
                  onClick={() => openModal('create')}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition flex items-center gap-2 font-medium"
                >
                  <Users size={18} />
                  New Patient
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Patients"
              value={patientStats.total}
              icon={Users}
              bgColor="bg-blue-500"
              textColor="text-white"
            />
            <StatsCard
              title="Active Patients"
              value={patientStats.active}
              icon={UserCheck}
              bgColor="bg-green-500"
              textColor="text-white"
            />
            <StatsCard
              title="Inactive Patients"
              value={patientStats.inactive}
              icon={UserX}
              bgColor="bg-red-500"
              textColor="text-white"
            />
            <StatsCard
              title="Recent Visits (7d)"
              value={patientStats.recentVisits}
              icon={Calendar}
              bgColor="bg-purple-500"
              textColor="text-white"
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, MRN, phone, or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {searchQuery !== debouncedSearchQuery &&
                    searchQuery.length > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 border rounded-lg transition flex items-center gap-2 ${
                    showFilters
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={18} />
                  Filters
                  {hasActiveFilters && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {
                        [
                          debouncedSearchQuery,
                          statusFilter !== 'active',
                          genderFilter,
                          bloodTypeFilter,
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={genderFilter}
                        onChange={e => setGenderFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Type
                      </label>
                      <select
                        value={bloodTypeFilter}
                        onChange={e => setBloodTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Blood Types</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && !showFilters && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {debouncedSearchQuery && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Search: "{debouncedSearchQuery}"
                  </span>
                )}
                {statusFilter !== 'active' && statusFilter && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                    {statusFilter}
                  </span>
                )}
                {genderFilter && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                    {genderFilter}
                  </span>
                )}
                {bloodTypeFilter && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {bloodTypeFilter}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {debouncedSearchQuery && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle size={16} />
              <span>
                Found <strong>{patients.length}</strong> patient(s) matching
                your search
              </span>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <LoadingOverlay />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          MRN
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Patient Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Gender
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Blood Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {patients.length > 0 ? (
                        patients.map(patient => (
                          <tr
                            key={patient._id}
                            className="hover:bg-gray-50 transition"
                          >
                            {/* MRN */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.medicalRecordNumber || 'N/A'}
                              </div>
                            </td>

                            {/* Name */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm font-medium text-gray-900">
                                  {`${patient.firstname} ${
                                    patient.middlename || ''
                                  } ${patient.lastname}`.trim()}
                                </div>
                                {patient.email && (
                                  <div className="text-xs text-gray-500">
                                    {patient.email}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Gender */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700 capitalize">
                                {patient.gender}
                              </span>
                            </td>

                            {/* Age */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {patient.age}
                              </span>
                            </td>

                            {/* Phone */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {patient.phone}
                              </span>
                            </td>

                            {/* Blood Type */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                <Heart size={12} />
                                {patient.bloodType || 'Unknown'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                  !patient.isDeleted
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {!patient.isDeleted ? 'Active' : 'Inactive'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => openModal('view', patient._id)}
                                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => openModal('edit', patient._id)}
                                  className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"
                                  title="Edit Patient"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    openModal('delete', patient._id)
                                  }
                                  disabled={patient.isDeleted}
                                  className={`p-2 rounded-lg transition ${
                                    patient.isDeleted
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-red-600 hover:bg-red-50'
                                  }`}
                                  title={
                                    patient.isDeleted
                                      ? 'Already Inactive'
                                      : 'Deactivate Patient'
                                  }
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center">
                              <Users className="text-gray-300 mb-3" size={48} />
                              <div className="text-gray-500 text-lg font-medium">
                                {debouncedSearchQuery
                                  ? 'No patients found matching your search'
                                  : 'No patients found'}
                              </div>
                              <div className="text-gray-400 text-sm mt-1">
                                {debouncedSearchQuery
                                  ? 'Try adjusting your search or filters'
                                  : 'Click "New Patient" to add your first patient'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {patients.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <Pagination
                      currentPage={page}
                      page={page}
                      maxPage={patientsMaxPage || 1}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ReceptionistPatientRecords;
