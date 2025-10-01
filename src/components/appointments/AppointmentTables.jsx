import { Eye, Edit, Trash2 } from 'lucide-react';

import { formatDate } from '../../utils/dateFormatter';
import { formatTime } from '../../utils/FormatTime';

const AppointmentsTable = ({
  appointments,
  currentUser,
  onViewDetails,
  onEditAppointment,
  onCancelAppointment,
  pageItem,
  changing,
  showColumns = ['person', 'date', 'time', 'status', 'actions'],
}) => {
  // Get patient display info
  const getPatientDisplay = appointment => {
    const { patient, createdBy } = appointment;

    // If patient is a full object
    if (patient && typeof patient === 'object' && patient.fullName) {
      return {
        name: patient.displayName || patient.fullName,
        subInfo: patient.medicalRecordNumber
          ? `MRN: ${patient.medicalRecordNumber}`
          : `Age: ${patient.age || 'N/A'}`,
      };
    }

    // If createdBy has patient info
    if (createdBy && createdBy.role === 'patient') {
      return {
        name: `${createdBy.firstname || ''} ${createdBy.lastname || ''}`.trim(),
        subInfo: createdBy.phone || createdBy.email || '',
      };
    }

    // Fallback
    return {
      name:
        typeof patient === 'string'
          ? `Patient ID: ${patient}`
          : 'Unknown Patient',
      subInfo: '',
    };
  };

  // Get doctor display info
  const getDoctorDisplay = appointment => {
    const { doctor } = appointment;

    if (!doctor) return { name: 'Unknown Doctor', subInfo: '' };

    const name = `Dr. ${doctor.firstname || ''} ${
      doctor.lastname || ''
    }`.trim();
    const subInfo = doctor.specialization || doctor.department?.name || '';

    return { name, subInfo };
  };

  // Get person info based on user role
  const getPersonDisplay = appointment => {
    return currentUser.role === 'patient'
      ? getDoctorDisplay(appointment)
      : getPatientDisplay(appointment);
  };

  // Get action buttons based on role
  const renderActions = appt => {
    const actions = [];

    // View button - everyone can view
    actions.push(
      <button
        key="view"
        onClick={() => onViewDetails(appt)}
        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
        title="view"
      >
        <Eye size={18} />
      </button>
    );

    // Edit button - only receptionist
    if (currentUser.role === 'receptionist' && onEditAppointment) {
      actions.push(
        <button
          key="edit"
          onClick={() => onEditAppointment(appt)}
          className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition"
          title="edit"
        >
          <Edit size={18} />
        </button>
      );
    }

    // Cancel button
    if (onCancelAppointment && appt.status !== 'cancelled') {
      const canCancel =
        currentUser.role === 'receptionist' ||
        (currentUser.role === 'patient' && appt.status === 'scheduled');

      if (canCancel) {
        actions.push(
          <button
            key="cancel"
            onClick={() => onCancelAppointment(appt)}
            className={`p-2 rounded-lg transition flex items-center gap-1  ${
              appt.isDeleted
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed line-through'
                : 'text-red-600 hover:bg-red-100'
            }`}
          >
            <Trash2 size={18} />
          </button>
        );
      }
    }

    return <div className="flex flex-wrap gap-1">{actions}</div>;
  };

  return (
    <div className="overflow-x-auto bg-base-100 shadow rounded-lg">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* Person Column */}
            {showColumns.includes('person') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {currentUser.role === 'patient' ? 'Doctor' : 'Patient'}
              </th>
            )}

            {/* MRN Column - only for receptionist */}
            {showColumns.includes('mrn') &&
              currentUser.role === 'receptionist' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRN
                </th>
              )}

            {/* Date Column */}
            {showColumns.includes('date') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            )}

            {/* Time Column */}
            {showColumns.includes('time') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
            )}

            {/* Status Column */}
            {showColumns.includes('status') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            )}

            {/* Follow-up Column */}
            {showColumns.includes('followUp') && (
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                F/U
              </th>
            )}

            {/* Actions Column */}
            {showColumns.includes('actions') && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody
          className={`bg-white divide-y divide-gray-200 transition-opacity duration-300 ${
            changing ? 'opacity-50' : 'opacity-100'
          }`}
        >
          {pageItem.length > 0 ? (
            pageItem.map(appt => {
              const person = getPersonDisplay(appt);

              return (
                <tr key={appt._id} className="hover:bg-gray-50">
                  {/* Person Cell */}
                  {showColumns.includes('person') && (
                    <td className="px-4 py-3 whitespace-normal break-words max-w-[200px]">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {person.name}
                        </div>
                        {person.subInfo && (
                          <div className="text-sm text-gray-500 truncate">
                            {person.subInfo}
                          </div>
                        )}
                      </div>
                    </td>
                  )}

                  {/* MRN Cell */}
                  {showColumns.includes('mrn') &&
                    currentUser.role === 'receptionist' && (
                      <td className="px-4 py-3 whitespace-normal break-words max-w-[200px]">
                        <div className="text-gray-800 font-mono text-sm">
                          {appt.patient && typeof appt.patient === 'object'
                            ? appt.patient.medicalRecordNumber || 'N/A'
                            : 'N/A'}
                        </div>
                      </td>
                    )}

                  {/* Date Cell */}
                  {showColumns.includes('date') && (
                    <td className="px-4 py-3 whitespace-normal break-words max-w-[200px]">
                      <div className="text-gray-800">
                        {formatDate(appt.appointmentDate)}
                      </div>
                    </td>
                  )}

                  {/* Time Cell */}
                  {showColumns.includes('time') && (
                    <td className="px-4 py-3 whitespace-normal break-words max-w-[200px]">
                      <div className="text-gray-800">
                        {appt.timeSlot
                          ? `${formatTime(
                              appt.timeSlot.startTime
                            )} - ${formatTime(appt.timeSlot.endTime)}`
                          : 'TBD'}
                      </div>
                    </td>
                  )}

                  {/* Status Cell */}
                  {showColumns.includes('status') && (
                    <td className="px-4 py-3 whitespace-normal break-words max-w-[200px]">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          appt.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appt.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : appt.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : appt.status === 'rescheduled'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  )}

                  {/* Follow-up Cell */}
                  {showColumns.includes('followUp') && (
                    <td className="px-4 py-3 whitespace-normal break-words max-w-[200px]">
                      {appt.isFollowUp ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )}

                  {/* Actions Cell */}
                  {showColumns.includes('actions') && (
                    <td className="px-4 py-3 whitespace-normal break-words max-w-[200px]">
                      {renderActions(appt)}
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={showColumns.length}
                className="px-6 py-12 text-center text-gray-500 text-sm"
              >
                <div className="flex flex-col items-center">
                  <div className="text-4xl text-gray-300 mb-2">📅</div>
                  <div>No appointments found.</div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable;
