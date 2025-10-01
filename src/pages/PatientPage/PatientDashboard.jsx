import {
  Clock,
  CalendarClock,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
} from 'lucide-react';

import { ThemeToggle } from '../../components/generic/ThemeToggle';
import { useAppointments } from '../../context/AppointmentContext';
import AppointmentCard from '../../components/Card/AppointmentCard';
import LoadingOverlay from '../../components/generic/LoadingOverlay';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/Card/StatsCard';

const Header = ({ name = 'Guest', role = 'Patient' }) => (
  <header className="flex items-center justify-between px-16 py-4 border-b bg-base-100 border-base-300 shadow">
    <div>
      <h1 className="text-2xl font-bold text-base-content">
        Patient Dashboard
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <button className="relative p-2 rounded-lg border border-base-300 hover:bg-base-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
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
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs bg-warning text-warning-content grid place-items-center">
          3
        </span>
      </button>
      <div className="flex items-center gap-2 border border-base-300 px-4 py-2 rounded-lg bg-base-100">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-content grid place-items-center text-sm font-semibold">
          {name.charAt(0).toUpperCase() || 'G'}
        </div>
        <span className="text-sm font-medium text-base-content">
          {`${name} (${role})`}
        </span>
      </div>
    </div>
  </header>
);

const MainContent = ({ currentUser }) => {
  const fullname = `${currentUser.firstname} ${currentUser.middlename} ${currentUser.lastname}`;

  return (
    <main className="flex-1 flex flex-col pb-7 bg-base-200">
      <Header
        name={fullname || 'Guest'}
        role={currentUser?.role || 'Patient'}
      />
      <section className="flex-1 px-10">
        <Dashboard />
      </section>
    </main>
  );
};

const Dashboard = () => {
  const { myAppointments, isLoading } = useAppointments();
  const { currentUser } = useAuth();

  // Calculate statistics
  const totalAppointments = myAppointments.length;
  const completedAppointments = myAppointments.filter(
    appt => appt.status === 'completed'
  ).length;
  const cancelledAppointments = myAppointments.filter(
    appt => appt.status === 'cancelled'
  ).length;
  const scheduledAppointments = myAppointments.filter(
    appt => appt.status === 'scheduled'
  ).length;

  // Find today's appointment
  const appointmentToday = myAppointments.find(appt => {
    const today = new Date();
    const apptDate = new Date(appt.appointmentDate);

    return (
      apptDate.getFullYear() === today.getFullYear() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getDate() === today.getDate() &&
      appt.status === 'scheduled'
    );
  });

  // Find upcoming appointments (next 7 days)
  const upcomingAppointments = myAppointments.filter(appt => {
    const today = new Date();
    const apptDate = new Date(appt.appointmentDate);
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return (
      apptDate > today && apptDate <= nextWeek && appt.status === 'scheduled'
    );
  });

  // Find recent appointments (last 30 days completed)
  const recentAppointments = myAppointments
    .filter(appt => {
      const today = new Date();
      const apptDate = new Date(appt.appointmentDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      return (
        apptDate >= thirtyDaysAgo &&
        apptDate <= today &&
        appt.status === 'completed'
      );
    })
    .slice(0, 3); // Show only last 3

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="space-y-8 py-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-base-content">
          Welcome back, {currentUser?.name || 'Guest'}!
        </h1>
        <p className="text-base-content/70 mt-2 text-lg">
          Here's an overview of your healthcare appointments and activity.
        </p>
      </div>

      {/* Statistics Cards */}
      <section>
        <h2 className="text-xl font-semibold text-base-content mb-6">
          Appointment Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Appointments"
            value={totalAppointments}
            icon={Calendar}
            bgColor="bg-primary"
            textColor="text-primary-content"
          />
          <StatsCard
            title="Completed"
            value={completedAppointments}
            icon={CheckCircle}
            bgColor="bg-success"
            textColor="text-success-content"
          />
          <StatsCard
            title="Scheduled"
            value={scheduledAppointments}
            icon={Clock}
            bgColor="bg-info"
            textColor="text-info-content"
          />
          <StatsCard
            title="Cancelled"
            value={cancelledAppointments}
            icon={XCircle}
            bgColor="bg-error"
            textColor="text-error-content"
          />
        </div>
      </section>

      {/* Today's Appointment */}
      <section>
        <h2 className="text-xl font-semibold text-base-content flex items-center mb-6">
          <Clock size={24} className="mr-3 text-primary" />
          Today's Appointment
        </h2>
        {appointmentToday ? (
          <div className="bg-base-100 rounded-lg shadow-sm">
            <AppointmentCard
              role={currentUser?.role}
              appointment={appointmentToday}
            />
          </div>
        ) : (
          <div className="text-center text-base-content/70 bg-base-100 p-8 rounded-lg shadow-sm border-2 border-dashed border-base-300">
            <Clock size={48} className="mx-auto mb-4 text-base-content/30" />
            <p className="text-lg">No appointments scheduled for today</p>
            <p className="text-sm mt-2">Enjoy your free day!</p>
          </div>
        )}
      </section>

      {/* Upcoming Appointments */}
      <section>
        <h2 className="text-xl font-semibold text-base-content flex items-center mb-6">
          <CalendarClock size={24} className="mr-3 text-primary" />
          Upcoming Appointments (Next 7 Days)
        </h2>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div
                key={appointment._id}
                className="bg-base-100 rounded-lg shadow-sm"
              >
                <AppointmentCard
                  role={currentUser?.role}
                  appointment={appointment}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-base-content/70 bg-base-100 p-8 rounded-lg shadow-sm border-2 border-dashed border-base-300">
            <CalendarClock
              size={48}
              className="mx-auto mb-4 text-base-content/30"
            />
            <p className="text-lg">No upcoming appointments in the next week</p>
            <button className="btn btn-primary mt-4">
              Schedule an Appointment
            </button>
          </div>
        )}
      </section>

      {/* Recent Appointments */}
      {recentAppointments.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-base-content flex items-center mb-6">
            <TrendingUp size={24} className="mr-3 text-primary" />
            Recent Appointments
          </h2>
          <div className="space-y-4">
            {recentAppointments.map(appointment => (
              <div
                key={appointment._id}
                className="bg-base-100 rounded-lg shadow-sm"
              >
                <AppointmentCard
                  role={currentUser?.role}
                  appointment={appointment}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-base-content mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary btn-lg justify-start">
            <Calendar size={20} className="mr-2" />
            Schedule New Appointment
          </button>
          <button className="btn btn-outline btn-lg justify-start">
            <Users size={20} className="mr-2" />
            View All Doctors
          </button>
          <button className="btn btn-outline btn-lg justify-start">
            <TrendingUp size={20} className="mr-2" />
            Medical History
          </button>
        </div>
      </section>
    </div>
  );
};

const PatientDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex bg-base-200">
      <MainContent currentUser={currentUser} />
    </div>
  );
};

export default PatientDashboard;
