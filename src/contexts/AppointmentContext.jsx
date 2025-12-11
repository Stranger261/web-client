import { createContext, useCallback, useContext, useState } from 'react';
import appointmentApi from '../services/appointmentApi';

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const bookUserAppointment = useCallback(async appointmentData => {
    try {
      setIsBooking(true);
      const res = await appointmentApi.bookUserAppointment(appointmentData);
      console.log(res);

      return res;
    } catch (error) {
      console.error('Book appointment error: ', error);
      throw error;
    } finally {
      setIsBooking(false);
    }
  }, []);

  const getPatientAppointments = useCallback(async (patientUuid, filters) => {
    try {
      const patientAppointment = await appointmentApi.getPatientAppointments(
        patientUuid,
        filters
      );

      setAppointments(patientAppointment?.data?.appointments || []);
      setPagination(patientAppointment?.data?.pagination);
      return patientAppointment;
    } catch (error) {
      console.error('Get patient appointment error: ', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAppointmentById = useCallback(async appointmentId => {
    try {
      setIsLoading(true);
      const appointment = await appointmentApi.getAppointmentById(
        appointmentId
      );
      console.log(appointment);

      setCurrentAppointment(appointment?.data?.data);
      return appointment;
    } catch (error) {
      console.error('Get appointment by id error: ', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkInAppointment = useCallback(async appointmentId => {
    try {
      setIsLoading(true);
      const res = await appointmentApi.checkInAppointment(appointmentId);
      console.log(res);
      return res;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (appointmentId, reason) => {
    try {
      setIsLoading(true);
      const res = await appointmentApi.cancelAppointment(appointmentId, {
        reason,
      });
      console.log(res);
      return res;
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rescheduleAppointment = useCallback(
    async (appointmentId, newDate, newTime) => {
      try {
        setIsLoading(true);
        const res = await appointmentApi.rescheduleAppointment(appointmentId, {
          new_date: newDate,
          new_time: newTime,
        });
        console.log(res);
        return res;
      } catch (error) {
        console.error('Reschedule appointment error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getAppointmentTypes = useCallback(async () => {
    try {
      const response = await appointmentApi.getAppointmentTypes();
      return response.data || [];
    } catch (error) {
      console.error('Get appointment types error:', error);
      throw error;
    }
  }, []);

  const extendAppointment = useCallback(
    async (appointmentId, additional_minutes) => {
      try {
        setIsLoading(true);
        const res = await appointmentApi.extendAppointment(
          appointmentId,
          additional_minutes
        );
        console.log(res);

        return res;
      } catch (error) {
        console.error('Extend appointment error: ', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const completeAppointment = useCallback(async (appointmentId, notes) => {
    try {
      setIsLoading(true);
      const res = await appointmentApi.completeAppointment(
        appointmentId,
        notes
      );
      console.log(res);

      return res;
    } catch (error) {
      console.error('Extend appointment error: ', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (appointmentId, paymentData) => {
    try {
      setIsLoading(true);
      const res = await appointmentApi.processPayment(
        appointmentId,
        paymentData
      );
      console.log(res);

      return res;
    } catch (error) {
      console.error('Extend appointment error: ', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateFee = useCallback(async appointmentDetails => {
    try {
      setIsLoading(true);
      const res = await appointmentApi.calculateFee(appointmentDetails);
      console.log(res);

      return res;
    } catch (error) {
      console.error('Extend appointment error: ', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAppointments = useCallback(
    async (patientId, filters = {}) => {
      await getPatientAppointments(patientId, filters);
    },
    [getPatientAppointments]
  );

  const value = {
    appointments,
    currentAppointment,
    isLoading,
    isBooking,
    pagination,
    bookUserAppointment,
    getPatientAppointments,
    getAppointmentById,
    checkInAppointment,
    cancelAppointment,
    rescheduleAppointment,
    getAppointmentTypes,
    extendAppointment,
    completeAppointment,
    processPayment,
    calculateFee,
    refreshAppointments,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);

  if (!context) {
    throw new Error('useAppointment must be used within Appointment Provider');
  }
  return context;
};

export default AppointmentProvider;
