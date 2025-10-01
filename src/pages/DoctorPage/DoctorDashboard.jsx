import { useEffect } from 'react';
import { Calendar, Users, ClipboardList, Activity } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../context/AppointmentContext';

import LoadingOverlay from '../../components/generic/LoadingOverlay';
import { ThemeToggle } from '../../components/generic/ThemeToggle';

const DoctorDashboard = () => {
  const { currentUser } = useAuth();

  const { getDoctorAppointments, isLoading } = useAppointments();

  useEffect(() => {
    const init = async () => {
      if (!currentUser) return;
      const data = await getDoctorAppointments();
      console.log(data);
    };

    init();
  }, [currentUser, getDoctorAppointments]);

  if (isLoading) return <LoadingOverlay />;

  return (
    <div>
      <header className="flex items-center justify-between px-16 py-4 border-b bg-base-100 border-base-300 shadow">
        <div>
          {/* REFACTORED: text-base-content will be dark on light themes and light on dark themes. */}
          <h1 className="text-2xl font-bold text-base-content">
            Patient Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* REFACTORED: Using theme-aware colors for border and hover states. */}
          <button className="relative p-2 rounded-lg border border-base-300 hover:bg-base-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              // REFACTORED: Icon color now uses text-base-content.
              className="h-5 w-5 text-base-content"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405M19 13V8a7 7 0 10-14 0v5l-1.405 1.405A2.032 2.032 0 004 17h16z"
              />
            </svg>
            {/* REFACTORED: Using semantic colors for the notification badge. */}
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs bg-warning text-warning-content grid place-items-center">
              3
            </span>
          </button>
          {/* REFACTORED: The user info block is now fully themed. */}
          <div className="flex items-center gap-2 border border-base-300 px-4 py-2 rounded-lg bg-white">
            <span className="text-sm font-medium text-base-content">
              {`${currentUser.firstname} ${currentUser.middlename} ${currentUser.lastname} (${currentUser.role})`}
            </span>
          </div>
        </div>
      </header>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome Section */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold">Good Morning, Dr. John Doe 👋</h2>
          <p className="text-gray-500">Here’s what’s happening today</p>
        </div>

        {/* Today’s Appointments */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold">Today’s Appointments</h3>
          </div>
          <p className="text-3xl font-bold mt-2">8</p>
          <ul className="mt-3 text-sm text-gray-600">
            <li>09:00 AM – Jane Smith</li>
            <li>10:30 AM – Mark Johnson</li>
            <li>11:00 AM – Emily Davis</li>
          </ul>
        </div>

        {/* My Patients */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-green-500" />
            <h3 className="font-semibold">My Patients</h3>
          </div>
          <p className="text-3xl font-bold mt-2">124</p>
          <p className="text-sm text-gray-600">Patients consulted this month</p>
        </div>

        {/* Pending Follow-ups */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-yellow-500" />
            <h3 className="font-semibold">Pending Follow-ups</h3>
          </div>
          <ul className="mt-3 text-sm text-gray-600">
            <li>Sarah Lee – Lab results pending</li>
            <li>Michael Brown – Needs prescription renewal</li>
            <li>Alice White – Follow-up appointment not booked</li>
          </ul>
        </div>

        {/* Weekly Stats */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-500" />
            <h3 className="font-semibold">Weekly Stats</h3>
          </div>
          <p className="text-sm text-gray-600 mt-3">Appointments: 34</p>
          <p className="text-sm text-gray-600">Prescriptions: 22</p>
          <p className="text-sm text-gray-600">Follow-ups: 10</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
