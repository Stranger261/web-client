import { createContext, useState, useContext, useCallback } from 'react';
import {
  fetchDepartments,
  fetchDoctors,
  fetchDoctorSchedule,
  fetchSchedulesForDepartment,
} from '../services/scheduleApi';

export const ScheduleContext = createContext();
export const useSchedule = () => useContext(ScheduleContext);

const ScheduleProvider = ({ children }) => {
  const [allDoctors, setAllDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [combinedSchedule, setCombinedSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Keep track of the last fetch type and ID to reuse when changing months
  const [lastFetchParams, setLastFetchParams] = useState(null);

  const getDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (err) {
      setError('Failed to load departments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDoctors();
      setAllDoctors(data);
    } catch (err) {
      setError('Failed to load doctors.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSchedule = useCallback(async (doctorId, month) => {
    setIsLoading(true);
    setError(null);
    setCombinedSchedule(null); // Clear the other schedule type
    setLastFetchParams({ type: 'doctor', id: doctorId }); // Remember this fetch
    try {
      const data = await fetchDoctorSchedule(doctorId, month);
      setDoctorSchedule(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCombinedSchedule = useCallback(async (departmentId, month) => {
    setIsLoading(true);
    setError(null);
    setDoctorSchedule(null); // Clear the other schedule type
    setLastFetchParams({ type: 'department', id: departmentId }); // Remember this fetch
    try {
      const data = await fetchSchedulesForDepartment(departmentId, month);
      setCombinedSchedule(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // This function is called by the Calendar to fetch new data
  const changeMonth = useCallback(
    async newMonth => {
      if (!lastFetchParams) return; // Do nothing if a schedule hasn't been fetched yet

      setIsLoading(true);
      setError(null);
      try {
        if (lastFetchParams.type === 'doctor') {
          await getSchedule(lastFetchParams.id, newMonth);
        } else if (lastFetchParams.type === 'department') {
          await getCombinedSchedule(lastFetchParams.id, newMonth);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [lastFetchParams, getSchedule, getCombinedSchedule]
  );

  const clearSchedules = useCallback(() => {
    setDoctorSchedule(null);
    setCombinedSchedule(null);
    setLastFetchParams(null);
  }, []);

  const value = {
    allDoctors,
    doctorSchedule,
    combinedSchedule,
    departments,
    isLoading,
    error,
    getDoctors,
    getSchedule,
    getCombinedSchedule,
    getDepartments,
    clearSchedules,
    changeMonth,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
export default ScheduleProvider;
