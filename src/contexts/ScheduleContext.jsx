import { createContext, useCallback, useContext, useState } from 'react';
import scheduleApi from '../services/scheduleApi';

const ScheduleContext = createContext();

const ScheduleProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [combinedSchedule, setCombinedSchedule] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await scheduleApi.getDepartments();

      setDepartments(res?.data || []);
      return res || [];
    } catch (error) {
      console.error('Get departments error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllDoctors = useCallback(async (departmentId, patientUuid) => {
    try {
      setIsLoading(true);
      let res;

      if (departmentId) {
        res = await scheduleApi.getDoctorsByDept(departmentId, patientUuid);
      } else {
        res = await scheduleApi.getAllDoctors();
      }
      const doctors = res?.data || [];

      setAllDoctors(doctors);

      return doctors;
    } catch (error) {
      console.error('Get all doctors error: ', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDoctorAvailability = useCallback(
    async (doctorUuid, startDate, endDate) => {
      try {
        setIsLoading(true);

        const res = await scheduleApi.getDoctorsAvailability(
          doctorUuid,
          startDate,
          endDate
        );

        setDoctorSchedule(res.data || []);
        return res;
      } catch (error) {
        console.error('Get doc availability error: ', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getCombinedSchedule = useCallback(
    async (departmentId, startDate, endDate) => {
      try {
        setIsLoading(true);

        const res = await scheduleApi.getCombinedSchedule(
          departmentId,
          startDate,
          endDate
        );

        setCombinedSchedule(res.data || []);
        return res;
      } catch (error) {
        console.error('Get combined sched error: ', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getDoctorAppointment = useCallback(async (doctorUuid, filters) => {
    try {
      setIsLoading(true);

      const res = await scheduleApi.getDoctorAppointments(doctorUuid, filters);
      console.log(res);

      setDoctorAppointments(res.data || []);
      return res;
    } catch (error) {
      console.error('Get doc appointment error: ', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changeMonth = useCallback(
    async yearMonth => {
      const [year, month] = yearMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      try {
        if (doctorSchedule?.doctor) {
          await getDoctorAvailability(
            doctorSchedule.doctor.id,
            startDate,
            endDate
          );
        } else if (combinedSchedule?.length > 0) {
          const deptId = combinedSchedule[0]?.doctor?.department?._id;
          if (deptId) {
            await getCombinedSchedule(deptId, startDate, endDate);
          }
        }
      } catch (error) {
        console.error('Change month error: ', error);
      }
    },
    [
      doctorSchedule,
      combinedSchedule,
      getDoctorAvailability,
      getCombinedSchedule,
    ]
  );

  const clearSchedules = useCallback(() => {
    setDoctorSchedule(null);
    setCombinedSchedule(null);
    // setLastFetchParams(null);
  }, []);

  const value = {
    departments,
    allDoctors,
    doctorSchedule,
    combinedSchedule,
    doctorAppointments,
    isLoading,
    getDepartments,
    getAllDoctors,
    getDoctorAvailability,
    getCombinedSchedule,
    getDoctorAppointment,
    changeMonth,
    clearSchedules,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);

  if (!context) {
    throw new Error('Schedule context must be used within SchduleProvider');
  }
  return context;
};

export default ScheduleProvider;
