import { format } from 'date-fns';

const DailyStatistics = ({ date, statistics }) => {
  if (!statistics) return null;

  const { appointments, byType, byMode } = statistics;

  const statCards = [
    {
      label: 'Total Slots',
      value: statistics.totalSlots,
      color: 'blue',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      ),
    },
    {
      label: 'Available',
      value: statistics.availableSlots,
      color: 'green',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    {
      label: 'Booked',
      value: statistics.bookedSlots,
      color: 'orange',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    {
      label: 'Completed',
      value: appointments.completed,
      color: 'purple',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      ),
    },
  ];

  const statusBreakdown = [
    { label: 'Scheduled', value: appointments.scheduled, color: 'bg-blue-500' },
    {
      label: 'Confirmed',
      value: appointments.confirmed,
      color: 'bg-green-500',
    },
    {
      label: 'Checked In',
      value: appointments.checked_in,
      color: 'bg-purple-500',
    },
    {
      label: 'In Progress',
      value: appointments.in_progress,
      color: 'bg-yellow-500',
    },
    { label: 'Completed', value: appointments.completed, color: 'bg-gray-500' },
    { label: 'Cancelled', value: appointments.cancelled, color: 'bg-red-500' },
    { label: 'No Show', value: appointments.no_show, color: 'bg-red-700' },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-600',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600',
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Statistics</h2>
          <p className="text-sm text-gray-500">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(stat => {
          const colors = colorClasses[stat.color];
          return (
            <div
              key={stat.label}
              className={`${colors.bg} rounded-xl p-5 border-2 border-transparent hover:border-${stat.color}-200 transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`${colors.icon} w-10 h-10 rounded-lg flex items-center justify-center`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {stat.icon}
                  </svg>
                </div>
              </div>
              <div className={`text-3xl font-bold ${colors.text} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            Status Breakdown
          </h3>
          <div className="space-y-2">
            {statusBreakdown
              .filter(status => status.value > 0)
              .map(status => (
                <div
                  key={status.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${status.color}`}
                    ></div>
                    <span className="text-sm text-gray-700">
                      {status.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {status.value}
                  </span>
                </div>
              ))}
            {statusBreakdown.every(s => s.value === 0) && (
              <p className="text-sm text-gray-500 italic">
                No appointments yet
              </p>
            )}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
            By Type
          </h3>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">
                  {type.replace('_', ' ')}
                </span>
                <span className="text-lg font-bold text-gray-900">{count}</span>
              </div>
            ))}
            {Object.values(byType).every(v => v === 0) && (
              <p className="text-sm text-gray-500 italic">
                No appointments yet
              </p>
            )}
          </div>
        </div>

        {/* Mode Breakdown */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
            By Mode
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Online</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {byMode.online}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      appointments.total > 0
                        ? (byMode.online / appointments.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">In-Person</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {byMode.in_person}
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      appointments.total > 0
                        ? (byMode.in_person / appointments.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStatistics;
