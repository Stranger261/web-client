import { format } from 'date-fns';
import { useState } from 'react';

const SlotDetailsPanel = ({
  selectedDate,
  slots = [],
  loading = false,
  onClose,
  onViewAppointment,
  onCreateAppointment,
}) => {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'available' | 'booked'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter slots based on filter type and search
  const filteredSlots = slots.filter(slot => {
    // Filter by type
    if (filterType === 'available' && !slot.isAvailable) return false;
    if (filterType === 'booked' && slot.isAvailable) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const doctorName = `${slot.doctor?.person?.first_name || ''} ${
        slot.doctor?.person?.last_name || ''
      }`.toLowerCase();
      const patientName = slot.appointment
        ? `${slot.appointment.patient?.person?.first_name || ''} ${
            slot.appointment.patient?.person?.last_name || ''
          }`.toLowerCase()
        : '';
      const specialization = (slot.doctor?.specialization || '').toLowerCase();

      return (
        doctorName.includes(query) ||
        patientName.includes(query) ||
        specialization.includes(query)
      );
    }

    return true;
  });

  // Group slots by time
  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    const timeKey = slot.time;
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(slot);
    return acc;
  }, {});

  // Statistics
  const stats = {
    total: slots.length,
    available: slots.filter(s => s.isAvailable).length,
    booked: slots.filter(s => !s.isAvailable).length,
  };

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 flex flex-col items-center justify-center h-[600px]">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Date</h3>
        <p className="text-gray-500 text-center">
          Choose a date from the calendar to view appointments and available
          slots
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[800px] flex flex-col">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <p className="text-blue-100 text-sm">
              {format(selectedDate, 'EEEE')}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-blue-100">Total Slots</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{stats.available}</div>
            <div className="text-xs text-blue-100">Available</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{stats.booked}</div>
            <div className="text-xs text-blue-100">Booked</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({slots.length})
          </button>
          <button
            onClick={() => setFilterType('available')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'available'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Available ({stats.available})
          </button>
          <button
            onClick={() => setFilterType('booked')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              filterType === 'booked'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Booked ({stats.booked})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search doctor, patient, or specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Slots List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-600">Loading slots...</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              No Slots Found
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : 'No appointments or slots for this date'}
            </p>
            {stats.available > 0 && (
              <button
                onClick={onCreateAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Create Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedSlots)
              .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
              .map(([time, timeSlots]) => (
                <div
                  key={time}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Time Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-bold text-gray-900">{time}</span>
                      <span className="text-xs text-gray-500">
                        ({timeSlots.length}{' '}
                        {timeSlots.length === 1 ? 'slot' : 'slots'})
                      </span>
                    </div>
                  </div>

                  {/* Slots */}
                  <div className="divide-y divide-gray-100">
                    {timeSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          slot.isAvailable ? 'bg-white' : 'bg-blue-50/30'
                        }`}
                      >
                        {slot.appointment ? (
                          // Booked Appointment
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                                    Booked
                                  </span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">
                                  {slot.appointment.patient?.person?.first_name}{' '}
                                  {slot.appointment.patient?.person?.last_name}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  Dr.{' '}
                                  {slot.appointment.doctor?.person?.first_name}{' '}
                                  {slot.appointment.doctor?.person?.last_name}
                                </div>
                                {slot.appointment.doctor?.specialization && (
                                  <div className="text-xs text-gray-500 italic">
                                    {slot.appointment.doctor.specialization}
                                  </div>
                                )}
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  slot.appointment.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-700'
                                    : slot.appointment.status === 'confirmed'
                                      ? 'bg-green-100 text-green-700'
                                      : slot.appointment.status === 'checked_in'
                                        ? 'bg-purple-100 text-purple-700'
                                        : slot.appointment.status ===
                                            'in_progress'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : slot.appointment.status ===
                                              'completed'
                                            ? 'bg-gray-100 text-gray-700'
                                            : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {slot.appointment.status
                                  .replace('_', ' ')
                                  .toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                  />
                                </svg>
                                {slot.appointment.appointment_type.replace(
                                  '_',
                                  ' ',
                                )}
                              </div>
                              {slot.appointment.is_online_consultation && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <svg
                                    className="w-4 h-4"
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
                                  Online
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() =>
                                onViewAppointment(
                                  slot.appointment.appointment_id,
                                )
                              }
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          // Available Slot
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                                Available
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                Dr. {slot.doctor?.person?.first_name}{' '}
                                {slot.doctor?.person?.last_name}
                              </div>
                              {slot.doctor?.specialization && (
                                <div className="text-xs text-gray-600 italic ml-6">
                                  {slot.doctor.specialization}
                                </div>
                              )}
                              {slot.doctor?.department?.department_name && (
                                <div className="text-xs text-gray-500 ml-6 mt-1">
                                  {slot.doctor.department.department_name}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={onCreateAppointment}
                              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Book This Slot
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotDetailsPanel;
