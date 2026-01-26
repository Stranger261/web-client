import {
  Check,
  Calendar,
  Clock,
  User,
  Building2,
  Info,
  ArrowLeft,
  Mail,
  Phone,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatTime } from '../../../../utils/FormatTime';

export const ConfirmationStep = ({
  details,
  onReset,
  onClose,
  userRole = 'patient',
}) => {
  const departmentName = details?.department?.department_name || 'N/A';

  const doctorName = details?.doctor
    ? `Dr. ${details.doctor.firstname} ${details.doctor.lastname}`
    : 'Any Available Doctor';

  const formattedDate = details.date
    ? format(new Date(details.date), 'MMMM d, yyyy')
    : 'N/A';

  const formattedTime = details.time ? formatTime(details.time.time) : 'N/A';
  console.log(details);

  // Patient info for receptionist view
  const patientInfo =
    details.patient && userRole !== 'patient' ? (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          Patient Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <p className="flex items-center text-blue-800">
            <User className="w-4 h-4 mr-2" />
            <span>
              {details.patient.person.first_name}{' '}
              {details.patient.person.last_name}
            </span>
          </p>
          {details.patient.person.user &&
            details.patient.person?.user?.email && (
              <p className="flex items-center text-blue-800">
                <Mail className="w-4 h-4 mr-2" />
                <span>{details.patient.person.user?.email}</span>
              </p>
            )}
          {details.patient.person.user && details.patient.person.user.phone && (
            <p className="flex items-center text-blue-800">
              <Phone className="w-4 h-4 mr-2" />
              <span>{details.patient.person.user.phone}</span>
            </p>
          )}
        </div>
      </div>
    ) : null;

  return (
    <div className="text-center">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
        <Check size={32} />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-800 mt-4">
        Appointment {userRole === 'receptionist' ? 'Created' : 'Confirmed'}!
      </h3>
      <p className="text-gray-600 mt-2">
        <span>Appointment has been scheduled successfully.</span>
      </p>

      {/* Patient Info (for receptionist) */}
      {patientInfo}

      {/* Summary Box */}
      <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg text-left space-y-4">
        <h4 className="font-semibold text-lg border-b pb-2 mb-4">
          Appointment Summary
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="flex items-center text-gray-700">
              <Building2 className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
              <span className="font-medium">Department:</span>
              <span className="ml-2">{departmentName}</span>
            </p>

            <p className="flex items-center text-gray-700">
              <User className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
              <span className="font-medium">Doctor:</span>
              <span className="ml-2">{doctorName}</span>
            </p>
          </div>

          <div className="space-y-3">
            <p className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">{formattedDate}</span>
            </p>

            <p className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
              <span className="font-medium">Time:</span>
              <span className="ml-2">{formattedTime}</span>
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="flex items-start text-gray-700">
            <Info className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0 mt-1" />
            <span className="font-medium">Reason:</span>
            <span className="ml-2">{details.reason || 'Not provided'}</span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {userRole === 'receptionist' ? 'Back to Dashboard' : 'Close'}
        </button>

        <button
          onClick={onReset}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          {userRole === 'receptionist'
            ? 'Create Another Appointment'
            : 'Book Another Appointment'}
        </button>
      </div>
    </div>
  );
};
