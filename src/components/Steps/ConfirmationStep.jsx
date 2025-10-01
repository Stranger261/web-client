import { Check, Calendar, Clock, User, Building2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { formatTime } from '../../utils/FormatTime';

export const ConfirmationStep = ({ details, onReset }) => {
  // --- FIXES: Extract the displayable text from each object ---

  // 1. Get the department name from the department object.
  const departmentName = details.department ? details.department.name : 'N/A';

  // 2. Get the doctor's full name from the doctor object, or handle the "Any Doctor" case.
  const doctorName = details.doctor
    ? `Dr. ${details.doctor.firstname} ${details.doctor.lastname}`
    : 'Any Available Doctor';

  // 3. Format the Date object into a readable string.
  const formattedDate = details.date
    ? format(new Date(details.date), 'MMMM d, yyyy')
    : 'N/A';

  // 4. Format the time using the startTime from the time slot object.
  const formattedTime = details.time
    ? formatTime(details.time.startTime)
    : 'N/A';

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
        <Check size={32} />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mt-4">
        Appointment Confirmed!
      </h3>
      <p className="text-gray-600 mt-2">
        A confirmation has been sent to your email address.
      </p>
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-left space-y-4">
        <h4 className="font-semibold text-lg border-b pb-2 mb-4">
          Appointment Summary
        </h4>
        <p className="flex items-center text-gray-700">
          <Building2 className="w-5 h-5 mr-3 text-gray-500" />
          <strong>Department:</strong>
          <span className="ml-2">{departmentName}</span>
        </p>
        <p className="flex items-center text-gray-700">
          <User className="w-5 h-5 mr-3 text-gray-500" />
          <strong>Doctor:</strong>
          <span className="ml-2">{doctorName}</span>
        </p>
        <p className="flex items-center text-gray-700">
          <Calendar className="w-5 h-5 mr-3 text-gray-500" />
          <strong>Date:</strong>
          <span className="ml-2">{formattedDate}</span>
        </p>
        <p className="flex items-center text-gray-700">
          <Clock className="w-5 h-5 mr-3 text-gray-500" />
          <strong>Time:</strong>
          <span className="ml-2">{formattedTime}</span>
        </p>
        <p className="flex items-start text-gray-700">
          <Info className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0 mt-1" />
          <strong>Reason:</strong>
          <span className="ml-2">{details.reason || 'Not provided'}</span>
        </p>
      </div>
      <button
        onClick={onReset}
        className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        Book Another Appointment
      </button>
    </div>
  );
};
