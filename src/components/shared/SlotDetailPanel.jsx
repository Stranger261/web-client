// SlotDetailsPanel.jsx
import { format } from 'date-fns';

const SlotDetailsPanel = ({ selectedDate, slots = [], onClose }) => {
  if (!selectedDate || slots.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-bold mb-4">
          {selectedDate
            ? format(selectedDate, 'MMMM d, yyyy')
            : 'Select a date'}
        </h3>
        <p className="text-gray-500">No appointments for this day</p>
      </div>
    );
  }

  // Group slots by time
  const groupedSlots = slots.reduce((acc, slot) => {
    const timeKey = slot.time;
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(slot);
    return acc;
  }, {});

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.entries(groupedSlots)
          .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
          .map(([time, timeSlots]) => (
            <div key={time} className="border rounded-lg p-3 hover:bg-gray-50">
              <div className="font-semibold text-blue-600 mb-2">{time}</div>
              <div className="space-y-2">
                {timeSlots.map((slot, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-gray-300">
                    {slot.appointment ? (
                      // Show booked appointment
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {slot.appointment.patient?.person?.first_name}{' '}
                          {slot.appointment.patient?.person?.last_name}
                        </div>
                        <div className="text-gray-600">
                          Doctor: {slot.appointment.doctor?.person?.first_name}{' '}
                          {slot.appointment.doctor?.person?.last_name}
                          {slot.appointment.doctor?.specialization && (
                            <span className="text-gray-500">
                              {' '}
                              ({slot.appointment.doctor.specialization})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Status:{' '}
                          <span className="capitalize">
                            {slot.appointment.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Show available slot
                      <div className="text-sm">
                        <div className="text-green-600 font-medium">
                          Available
                        </div>
                        <div className="text-gray-600">
                          Doctor: {slot.doctor?.person?.first_name}{' '}
                          {slot.doctor?.person?.last_name}
                          {slot.doctor?.specialization && (
                            <span className="text-gray-500">
                              {' '}
                              ({slot.doctor.specialization})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SlotDetailsPanel;
