// Enhanced context/AppointmentContext.jsx
// Add these methods to your existing AppointmentContext

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  fetchMyAppointments,
  createAppointment,
  cancelAppointment,
  fetchAllAppointments,
  // Add these new API functions to your appointmentApi.js
  fetchPatientAppointmentHistory,
  reschedAppt,
  searchAppointments as searchAppointmentsAPI,
  fetchMyDoctors,
  createReceptionistAppointment as createAppointmentByReceptionist,
  fetchDoctorAppointments,
} from '../services/appointmentApi';
import { useAuth } from './AuthContext';

const AppointmentContext = createContext();

export const useAppointments = () => useContext(AppointmentContext);

const AppointmentProvider = ({ children }) => {
  // Your existing state
  const [myAppointments, setMyAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [myDoctors, setMyDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);

  // Add new state for receptionist features
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  const { currentUser } = useAuth();

  // Your existing methods...
  const getMyAppointments = useCallback(async () => {
    if (!currentUser?.role) {
      setMyAppointments([]);
      setIsBooking(false);
      return;
    }

    setIsLoading(true);
    try {
      setIsBooking(true);
      const appointmentsData = await fetchMyAppointments();
      setMyAppointments(appointmentsData || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setMyAppointments([]);
    } finally {
      setIsBooking(false);
      setIsLoading(false);
    }
  }, [currentUser]);

  const getAllAppointments = useCallback(async () => {
    if (!currentUser) {
      setAllAppointments([]);
      setIsBooking(false);
      return;
    }

    setIsLoading(true);
    try {
      setIsBooking(true);
      const appointments = await fetchAllAppointments();
      setAllAppointments(appointments || []);
      setFilteredAppointments(appointments || []); // Initialize filtered
      setError(null);
    } catch (error) {
      setError(error.message);
      setAllAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setIsBooking(false);
      setIsLoading(false);
    }
  }, [currentUser]);

  const bookUserAppointment = async appointmentData => {
    try {
      setIsBooking(true);
      const newAppointment = await createAppointment(appointmentData);
      setMyAppointments(prev => [...prev, newAppointment.data]);
      return newAppointment;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsBooking(false);
    }
  };

  const cancelUserAppointment = async appointmentId => {
    const cancelledAppointment = await cancelAppointment(appointmentId);
    await getMyAppointments();
    return cancelledAppointment;
  };

  // NEW METHODS FOR RECEPTIONIST FEATURES:

  // Get patient appointment history
  const getPatientAppointmentHistory = useCallback(async patientId => {
    try {
      const history = await fetchPatientAppointmentHistory(patientId);
      return history || [];
    } catch (error) {
      console.error('Error fetching patient history:', error);
      return [];
    }
  }, []);

  // Create appointment (for receptionist)
  const createReceptionistAppointment = useCallback(async appointmentData => {
    setIsCreating(true);
    try {
      const response = await createAppointmentByReceptionist(appointmentData);

      // Add to local state
      setAllAppointments(prev => [...prev, response.data]);
      setFilteredAppointments(prev => [...prev, response.data]);

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, []);

  // Update appointment
  const updateAppointmentDetails = useCallback(
    async (appointmentId, appointmentData) => {
      setIsUpdating(true);
      try {
        const response = await reschedAppt(appointmentId, appointmentData);

        // Update local state
        const updateAppointmentInState = appointments =>
          appointments.map(appt =>
            appt._id === appointmentId ? response.data : appt
          );

        setAllAppointments(updateAppointmentInState);
        setFilteredAppointments(updateAppointmentInState);
        if (currentUser.role === 'patient') {
          setMyAppointments(updateAppointmentInState);
        }

        return response;
      } catch (error) {
        setError(error.message);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [currentUser?.role]
  );

  // Cancel appointment (enhanced)
  const cancelAppointmentById = useCallback(
    async (appointmentId, reason = '') => {
      setIsUpdating(true);
      try {
        const response = await cancelAppointment(appointmentId, reason);

        // Update local state to reflect cancellation
        const updateCancelledAppointment = appointments =>
          appointments.map(appt =>
            appt._id === appointmentId
              ? { ...appt, status: 'cancelled', cancelReason: reason }
              : appt
          );

        setAllAppointments(updateCancelledAppointment);
        setFilteredAppointments(updateCancelledAppointment);
        if (currentUser.role === 'patient') {
          setMyAppointments(updateCancelledAppointment);
        }

        return response;
      } catch (error) {
        setError(error.message);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [currentUser?.role]
  );

  // Search and filter appointments
  const searchAndFilterAppointments = useCallback(
    async (searchTerm = '', filters = {}) => {
      if (
        !searchTerm &&
        Object.values(filters).every(val => val === 'all' || val === '')
      ) {
        setFilteredAppointments(allAppointments);
        return allAppointments;
      }

      setIsLoading(true);
      try {
        const results = await searchAppointmentsAPI(searchTerm, filters);
        setFilteredAppointments(results || []);
        return results || [];
      } catch (error) {
        console.error('Search failed, using client-side fallback:', error);
        // Fallback to client-side filtering
        const clientResults = clientSideFilter(
          allAppointments,
          searchTerm,
          filters
        );
        setFilteredAppointments(clientResults);
        return clientResults;
      } finally {
        setIsLoading(false);
      }
    },
    [allAppointments]
  );

  // Client-side filter fallback
  const clientSideFilter = useCallback(
    (appointments, searchTerm = '', filters = {}) => {
      let results = [...appointments];

      // Search term filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        results = results.filter(appointment => {
          // Patient name search
          const patientMatch =
            appointment.patient?.fullName
              ?.toLowerCase()
              .includes(searchLower) ||
            appointment.patient?.firstname
              ?.toLowerCase()
              .includes(searchLower) ||
            appointment.patient?.lastname
              ?.toLowerCase()
              .includes(searchLower) ||
            appointment.patient?.mrn?.toLowerCase().includes(searchLower) ||
            appointment.patient?.phone?.includes(searchTerm) ||
            appointment.patient?.email?.toLowerCase().includes(searchLower) ||
            // Check createdBy for patient users who book appointments
            appointment.createdBy?.firstname
              ?.toLowerCase()
              .includes(searchLower) ||
            appointment.createdBy?.lastname
              ?.toLowerCase()
              .includes(searchLower) ||
            appointment.createdBy?.email?.toLowerCase().includes(searchLower);

          // Doctor name search
          const doctorMatch =
            appointment.doctor?.firstname
              ?.toLowerCase()
              .includes(searchLower) ||
            appointment.doctor?.lastname?.toLowerCase().includes(searchLower) ||
            appointment.doctor?.specialization
              ?.toLowerCase()
              .includes(searchLower);

          // Reason search
          const reasonMatch = appointment.reasonForVisit
            ?.toLowerCase()
            .includes(searchLower);

          return patientMatch || doctorMatch || reasonMatch;
        });
      }

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        results = results.filter(
          appointment => appointment.status === filters.status
        );
      }

      if (filters.priority && filters.priority !== 'all') {
        results = results.filter(
          appointment => appointment.priority === filters.priority
        );
      }

      if (filters.isFollowUp && filters.isFollowUp !== 'all') {
        const isFollowUp = filters.isFollowUp === 'true';
        results = results.filter(
          appointment => appointment.isFollowUp === isFollowUp
        );
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        results = results.filter(appointment => {
          const apptDate = new Date(appointment.appointmentDate);
          apptDate.setHours(0, 0, 0, 0);

          switch (filters.dateRange) {
            case 'today':
              return apptDate.getTime() === today.getTime();

            case 'tomorrow': {
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return apptDate.getTime() === tomorrow.getTime();
            }

            case 'week': {
              const weekEnd = new Date(today);
              weekEnd.setDate(today.getDate() + 7);
              return apptDate >= today && apptDate <= weekEnd;
            }

            case 'month':
              return (
                apptDate.getMonth() === today.getMonth() &&
                apptDate.getFullYear() === today.getFullYear()
              );

            default:
              return true;
          }
        });
      }

      return results;
    },
    []
  );

  const getMyDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userDoctors = await fetchMyDoctors();
      setMyDoctors(userDoctors);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDoctorAppointments = useCallback(async docId => {
    try {
      const doctorAppointments = await fetchDoctorAppointments(docId);

      console.log(doctorAppointments);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, []);

  const resetFilters = useCallback(() => {
    setFilteredAppointments(allAppointments);
  }, [allAppointments]);

  // Refresh appointments based on user role
  const refreshAppointments = useCallback(async () => {
    if (currentUser?.role === 'patient') {
      await getMyAppointments();
    } else if (currentUser?.role === 'receptionist') {
      await getAllAppointments();
    }
  }, [currentUser?.role, getMyAppointments, getAllAppointments]);

  // Your existing useEffect
  useEffect(() => {
    if (!currentUser || !currentUser?.role) return;

    if (currentUser.role === 'patient') {
      getMyAppointments();
      getMyDoctors();
    }
    if (currentUser.role === 'receptionist') {
      getAllAppointments();
    }
    if (currentUser.role === 'doctor') {
      getDoctorAppointments(currentUser._id);
    }
  }, [
    getMyAppointments,
    getAllAppointments,
    getMyDoctors,
    getDoctorAppointments,
    currentUser,
  ]);

  const value = {
    // Existing values
    allAppointments,
    myAppointments,
    isBooking,
    isLoading,
    error,
    getAllAppointments,
    bookUserAppointment,
    cancelUserAppointment,
    refreshAppointments,

    // New values for receptionist features
    filteredAppointments,
    isCreating,
    isUpdating,
    getPatientAppointmentHistory,
    createReceptionistAppointment,
    updateAppointmentDetails,
    cancelAppointmentById,
    searchAndFilterAppointments,
    clientSideFilter,
    getMyDoctors,
    resetFilters,
    getDoctorAppointments,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export default AppointmentProvider;
