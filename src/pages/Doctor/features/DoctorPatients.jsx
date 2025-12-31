import { useEffect, useState } from 'react';

import {
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  Activity,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import Table from '../../../components/ui/table';
import Pagination from '../../../components/ui/pagination';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/badge';
import Card, { CardBody } from '../../../components/ui/card';
import { Select } from '../../../components/ui/select';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { Button } from '../../../components/ui/button';

import { COLORS, ITEMS_PER_PAGE } from '../../../configs/CONST';

import { usePatient } from '../../../contexts/PatientContext';
import { useAuth } from '../../../contexts/AuthContext';

const DoctorPatients = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const { getDoctorsPatients } = usePatient();
  const { currentUser } = useAuth();
  // State management
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // filters
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    searchQuery: '',
    status: '',
    gender: '',
  });

  // patient stats
  const [patientStats, setPatientStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    inactivePatients: 0,
    patientsWithInsurance: 0,
    totalAppointments: 0,
  });

  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== ''
  ).length;

  // fetch doctor's patients
  useEffect(() => {
    const apiFilter = {
      ...filters,
      limit: pagination.limit,
      page: pagination.currentPage,
    };

    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const minDelay = new Promise(res => setTimeout(res, 300));
        const apiCall = getDoctorsPatients(
          currentUser?.staff?.staff_uuid,
          apiFilter
        );

        const [, response] = await Promise.all([minDelay, apiCall]);

        setPatients(response.patients);
        setPagination(response.pagination);
        setPatientStats(response.stats);
      } catch (error) {
        const errMsg =
          error?.response?.message || error?.message || 'Something went wrong';
        console.error('Error fetching patients:', errMsg);
        toast.error(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [
    filters,
    pagination.currentPage,
    pagination.limit,
    currentUser?.staff?.staff_uuid,
    getDoctorsPatients,
  ]);

  // filter logic
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ searchQuery: '', status: '', gender: '' });
    setPagination({
      currentPage: 1,
      limit: ITEMS_PER_PAGE,
      total: 0,
      totalPages: 1,
    });
  };

  // pagination logic
  const handleLimitPage = newLimit => {
    console.log(newLimit);
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // for opening medical record
  const toggleMedicalRecord = recordId => {
    setExpandedRecordId(prev => (prev === recordId ? null : recordId));
  };

  // Calculate age
  const calculateAge = dob => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Get status badge variant
  const getStatusVariant = status => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get color for record type
  const getRecordTypeColor = type => {
    switch (type) {
      case 'consultation':
        return 'primary';
      case 'lab_result':
        return 'info';
      case 'imaging':
        return 'warning';
      case 'diagnosis':
        return 'danger';
      case 'procedure':
        return 'success';
      default:
        return 'default';
    }
  };

  // Table columns
  const columns = [
    {
      header: 'Patient Info',
      accessor: 'patient_info',
      render: row => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{
              background: `linear-gradient(135deg, ${COLORS.info} 0%, ${COLORS.primary} 100%)`,
            }}
          >
            {row.first_name[0]}
            {row.last_name[0]}
          </div>
          <div>
            <p
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {row.first_name} {row.last_name}
            </p>
            <p
              className="text-xs"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {row.mrn} • {row.patient_uuid}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Age/Gender',
      accessor: 'demographics',
      render: row => (
        <div>
          <p
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {calculateAge(row.date_of_birth)} years
          </p>
          <p
            className="text-xs capitalize"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            {row.gender}
          </p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      render: row => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone
              size={14}
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            />
            <span
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {row.phone}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail
              size={14}
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            />
            <span
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'First Visit',
      accessor: 'first_visit_date',
      render: row => (
        <span
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          {!row.first_visit_date
            ? 'N/A'
            : new Date(row.first_visit_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'patient_status',
      render: row => (
        <Badge
          variant={getStatusVariant(row.patient_status)}
          className="capitalize"
        >
          {row.patient_status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'center',
      render: row => (
        <div className="flex items-center gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            iconOnly
            onClick={e => {
              e.stopPropagation();
              handleViewPatient(row);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            iconOnly
            onClick={e => {
              e.stopPropagation();
              handleEditPatient(row);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            iconOnly
            onClick={e => {
              e.stopPropagation();
              handleDeletePatient(row);
            }}
          />
        </div>
      ),
    },
  ];

  // Handlers
  const handleViewPatient = patient => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
    setExpandedRecordId(null); // Reset expanded record
  };

  const handleEditPatient = patient => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  };

  const handleDeletePatient = patient => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPatients(
        patients.filter(p => p.patient_id !== selectedPatient.patient_id)
      );
      setIsDeleteModalOpen(false);
      setSelectedPatient(null);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="p-8 max-w-full">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          My Patients
        </h1>
        <p
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Manage and view all your registered patients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card hover>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  Total Patients
                </p>
                <p
                  className="text-3xl font-semibold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {patientStats.totalPatients}
                </p>
              </div>
              <User size={32} style={{ color: COLORS.info }} />
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  Active Patients
                </p>
                <p
                  className="text-3xl font-semibold"
                  style={{ color: COLORS.success }}
                >
                  {patientStats.activePatients}
                </p>
              </div>
              <Activity size={32} style={{ color: COLORS.success }} />
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  With Insurance
                </p>
                <p
                  className="text-3xl font-semibold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {patientStats.patientsWithInsurance}
                </p>
              </div>
              <FileText size={32} style={{ color: COLORS.warning }} />
            </div>
          </CardBody>
        </Card>

        <Card hover>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  Appointments
                </p>
                <p
                  className="text-3xl font-semibold"
                  style={{ color: COLORS.info }}
                >
                  {patientStats.totalAppointments}
                </p>
              </div>
              <Calendar size={32} style={{ color: COLORS.info }} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <header className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg mb-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div className="min-w-0 flex-shrink">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My Appointments
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your patient consultations and schedules
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto flex-shrink-0">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="text-blue-600" size={18} />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Filter Appointments
                </h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  name="searchQuery"
                  value={filters.searchQuery}
                  onChange={handleFilterChange}
                  placeholder="Search by patient firstname, lastname or MRN..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Status Filter */}
              <Select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'deceased', label: 'Deceased' },
                ]}
              />

              {/* Gender */}
              <Select
                label="Gender"
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'others', label: 'Others' },
                ]}
              />
            </div>

            {/* Clear Button */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
              >
                <X size={16} className="mr-1" />
                Clear All Filters
              </Button>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Active Filters:
                </span>
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || key === 'search') return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800"
                    >
                      {key.replace('_', ' ')}: {value}
                      <button
                        onClick={() =>
                          handleFilterChange({
                            target: { name: key, value: '' },
                          })
                        }
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-sm p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Table */}
      {isLoading ? (
        <div
          className="rounded-xl shadow-sm border p-16 flex flex-col items-center justify-center"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
            minHeight: '400px',
          }}
        >
          <LoadingSpinner size="lg" />
          <p
            className="mt-4 text-sm"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Loading patients data...
          </p>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={patients}
            onRowClick={handleViewPatient}
            hoverable={true}
          />

          {/* Pagination */}
          {patients.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={patients.length}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitPage}
            />
          )}
        </>
      )}

      {/* View Patient Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setExpandedRecordId(null);
        }}
        title="Patient Details"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Full Name
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {selectedPatient.first_name} {selectedPatient.middle_name}{' '}
                    {selectedPatient.last_name} {selectedPatient.suffix}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Patient ID
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {selectedPatient.patient_uuid}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    MRN
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {selectedPatient.mrn}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Date of Birth
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {new Date(
                      selectedPatient.date_of_birth
                    ).toLocaleDateString()}{' '}
                    ({calculateAge(selectedPatient.date_of_birth)} year(s) old)
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Gender
                  </p>
                  <p
                    className="font-medium capitalize"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {selectedPatient.gender}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Blood Type
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {selectedPatient.blood_type || 'N/A'}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Civil Status
                  </p>
                  <p
                    className="font-medium capitalize"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {selectedPatient.civil_status || 'N/A'}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Occupation
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {selectedPatient.occupation || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Contact Information
              </h3>
              <div className="space-y-4">
                {/* Primary Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Phone
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {selectedPatient.phone}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Email
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {selectedPatient.email}
                    </p>
                  </div>
                </div>

                {/* Emergency Contacts */}
                {selectedPatient.contacts &&
                  selectedPatient.contacts.length > 0 && (
                    <div className="mt-4">
                      <p
                        className="text-sm font-semibold mb-3"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        Additional Contacts
                      </p>
                      <div className="space-y-3">
                        {selectedPatient.contacts.map(contact => (
                          <div
                            key={contact.contact_id}
                            className="p-3 rounded-lg border"
                            style={{
                              backgroundColor: isDarkMode
                                ? COLORS.background.dark
                                : COLORS.background.light,
                              borderColor: isDarkMode
                                ? COLORS.border.dark
                                : COLORS.border.light,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={
                                  contact.is_primary ? 'success' : 'warning'
                                }
                              >
                                {contact.contact_type}
                              </Badge>
                              {contact.relationship && (
                                <span
                                  className="text-xs capitalize"
                                  style={{
                                    color: isDarkMode
                                      ? COLORS.text.light
                                      : COLORS.text.secondary,
                                  }}
                                >
                                  {contact.relationship}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {contact.contact_name && (
                                <div>
                                  <p
                                    className="text-xs"
                                    style={{
                                      color: isDarkMode
                                        ? COLORS.text.light
                                        : COLORS.text.secondary,
                                    }}
                                  >
                                    Name
                                  </p>
                                  <p
                                    className="text-sm font-medium"
                                    style={{
                                      color: isDarkMode
                                        ? COLORS.text.white
                                        : COLORS.text.primary,
                                    }}
                                  >
                                    {contact.contact_name}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p
                                  className="text-xs"
                                  style={{
                                    color: isDarkMode
                                      ? COLORS.text.light
                                      : COLORS.text.secondary,
                                  }}
                                >
                                  Phone Number
                                </p>
                                <p
                                  className="text-sm font-medium"
                                  style={{
                                    color: isDarkMode
                                      ? COLORS.text.white
                                      : COLORS.text.primary,
                                  }}
                                >
                                  {contact.contact_number}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Address Information */}
            {selectedPatient.addresses &&
              selectedPatient.addresses.length > 0 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Address Information
                  </h3>
                  <div className="space-y-3">
                    {selectedPatient.addresses.map(address => (
                      <div
                        key={address.address_id}
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: isDarkMode
                            ? COLORS.background.dark
                            : COLORS.background.light,
                          borderColor: isDarkMode
                            ? COLORS.border.dark
                            : COLORS.border.light,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Badge
                            variant={address.is_primary ? 'success' : 'default'}
                            className="capitalize"
                          >
                            {address.address_type}
                          </Badge>
                          {address.is_primary && (
                            <span
                              className="text-xs"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.light
                                  : COLORS.text.secondary,
                              }}
                            >
                              Primary Address
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {/* Street Address */}
                          {(address.house_number ||
                            address.street_name ||
                            address.subdivision) && (
                            <p
                              className="text-sm"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {[
                                address.unit_floor,
                                address.building_name,
                                address.house_number,
                                address.street_name,
                                address.subdivision,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          )}

                          {/* Location */}
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {[address.barangay, address.city, address.province]
                              .filter(Boolean)
                              .join(', ')}
                          </p>

                          {/* Zip Code */}
                          {address.zip_code && (
                            <p
                              className="text-sm"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.light
                                  : COLORS.text.secondary,
                              }}
                            >
                              Zip Code: {address.zip_code}
                            </p>
                          )}

                          {/* Landmark */}
                          {address.landmark && (
                            <p
                              className="text-xs"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.light
                                  : COLORS.text.secondary,
                              }}
                            >
                              Landmark: {address.landmark}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Insurance Information */}
            {selectedPatient.insurance_provider && (
              <div>
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Insurance Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Provider
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {selectedPatient.insurance_provider}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Insurance Number
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {selectedPatient.insurance_number}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Expiry Date
                    </p>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {new Date(
                        selectedPatient.insurance_expiry
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Records */}
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Medical Records
              </h3>
              {selectedPatient.medicalRecords &&
              selectedPatient.medicalRecords.length > 0 ? (
                <div className="space-y-3">
                  {selectedPatient.medicalRecords.map(record => {
                    const isExpanded = expandedRecordId === record.record_id;

                    return (
                      <Card key={record.record_id} hover>
                        <CardBody padding={false}>
                          {/* Record Header - Always Visible */}
                          <div
                            className="p-4 cursor-pointer flex justify-between items-center"
                            onClick={() =>
                              toggleMedicalRecord(record.record_id)
                            }
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge
                                  variant={getRecordTypeColor(
                                    record.record_type
                                  )}
                                  className="capitalize"
                                >
                                  {record.record_type?.replace('_', ' ')}
                                </Badge>
                                <span
                                  className="text-sm"
                                  style={{
                                    color: isDarkMode
                                      ? COLORS.text.light
                                      : COLORS.text.secondary,
                                  }}
                                >
                                  {new Date(
                                    record.record_date
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p
                                className="font-medium"
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.white
                                    : COLORS.text.primary,
                                }}
                              >
                                {record.diagnosis ||
                                  record.chief_complaint ||
                                  'Medical Record'}
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp
                                size={20}
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.light
                                    : COLORS.text.secondary,
                                }}
                              />
                            ) : (
                              <ChevronDown
                                size={20}
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.light
                                    : COLORS.text.secondary,
                                }}
                              />
                            )}
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div
                              className="px-4 pb-4 border-t"
                              style={{
                                borderColor: isDarkMode
                                  ? COLORS.border.dark
                                  : COLORS.border.light,
                              }}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {/* Visit Information */}
                                <div>
                                  <p
                                    className="text-xs font-semibold uppercase mb-2"
                                    style={{
                                      color: isDarkMode
                                        ? COLORS.text.light
                                        : COLORS.text.secondary,
                                    }}
                                  >
                                    Visit Information
                                  </p>
                                  <div className="space-y-2">
                                    {record.visit_type && (
                                      <div>
                                        <p
                                          className="text-xs"
                                          style={{
                                            color: isDarkMode
                                              ? COLORS.text.light
                                              : COLORS.text.secondary,
                                          }}
                                        >
                                          Visit Type
                                        </p>
                                        <p
                                          className="text-sm capitalize"
                                          style={{
                                            color: isDarkMode
                                              ? COLORS.text.white
                                              : COLORS.text.primary,
                                          }}
                                        >
                                          {record.visit_type.replace('_', ' ')}
                                        </p>
                                      </div>
                                    )}
                                    {record.visit_id && (
                                      <div>
                                        <p
                                          className="text-xs"
                                          style={{
                                            color: isDarkMode
                                              ? COLORS.text.light
                                              : COLORS.text.secondary,
                                          }}
                                        >
                                          Visit ID
                                        </p>
                                        <p
                                          className="text-sm"
                                          style={{
                                            color: isDarkMode
                                              ? COLORS.text.white
                                              : COLORS.text.primary,
                                          }}
                                        >
                                          {record.visit_id}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Chief Complaint */}
                                {record.chief_complaint && (
                                  <div className="md:col-span-2">
                                    <p
                                      className="text-xs font-semibold uppercase mb-2"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.light
                                          : COLORS.text.secondary,
                                      }}
                                    >
                                      Chief Complaint
                                    </p>
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.white
                                          : COLORS.text.primary,
                                      }}
                                    >
                                      {record.chief_complaint}
                                    </p>
                                  </div>
                                )}

                                {/* Diagnosis */}
                                {record.diagnosis && (
                                  <div className="md:col-span-2">
                                    <p
                                      className="text-xs font-semibold uppercase mb-2"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.light
                                          : COLORS.text.secondary,
                                      }}
                                    >
                                      Diagnosis
                                    </p>
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.white
                                          : COLORS.text.primary,
                                      }}
                                    >
                                      {record.diagnosis}
                                    </p>
                                  </div>
                                )}

                                {/* Treatment */}
                                {record.treatment && (
                                  <div className="md:col-span-2">
                                    <p
                                      className="text-xs font-semibold uppercase mb-2"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.light
                                          : COLORS.text.secondary,
                                      }}
                                    >
                                      Treatment
                                    </p>
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.white
                                          : COLORS.text.primary,
                                      }}
                                    >
                                      {record.treatment}
                                    </p>
                                  </div>
                                )}

                                {/* Prescription */}
                                {record.prescription && (
                                  <div className="md:col-span-2">
                                    <p
                                      className="text-xs font-semibold uppercase mb-2"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.light
                                          : COLORS.text.secondary,
                                      }}
                                    >
                                      Prescription
                                    </p>
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.white
                                          : COLORS.text.primary,
                                      }}
                                    >
                                      {record.prescription}
                                    </p>
                                  </div>
                                )}

                                {/* Notes */}
                                {record.notes && (
                                  <div className="md:col-span-2">
                                    <p
                                      className="text-xs font-semibold uppercase mb-2"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.light
                                          : COLORS.text.secondary,
                                      }}
                                    >
                                      Notes
                                    </p>
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: isDarkMode
                                          ? COLORS.text.white
                                          : COLORS.text.primary,
                                      }}
                                    >
                                      {record.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  No medical records available
                </p>
              )}
            </div>

            {/* Appointments */}
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Upcoming Appointments
              </h3>
              {selectedPatient.appointments &&
              selectedPatient.appointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedPatient.appointments.map(apt => (
                    <div
                      key={apt.appointment_id}
                      className="p-4 rounded-lg border flex justify-between items-center"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.background.dark
                          : COLORS.background.light,
                        borderColor: isDarkMode
                          ? COLORS.border.dark
                          : COLORS.border.light,
                      }}
                    >
                      <div>
                        <p
                          className="font-medium capitalize"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {apt.appointment_type?.replace('_', ' ')}
                        </p>
                        <p
                          className="text-sm mt-1"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          {new Date(apt.appointment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="info" className="capitalize">
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  No upcoming appointments
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <p
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Are you sure you want to delete patient{' '}
              <strong>
                {selectedPatient.first_name} {selectedPatient.last_name}
              </strong>
              ?
            </p>
            <p
              className="text-sm"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              This action will soft delete the patient record and can be
              restored later.
            </p>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete Patient
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatients;
