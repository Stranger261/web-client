import {
  Check,
  Calendar,
  Clock,
  User,
  Building2,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatTime } from '../../../../../utils/FormatTime';
import { Button } from '../../../../../components/ui/button';

export const ConfirmationStep = ({ details, onReset, onClose }) => {
  const departmentName = details?.department?.department_name || 'N/A';

  const doctorName = details?.doctor
    ? `Dr. ${details.doctor.firstname} ${details.doctor.lastname}`
    : 'Any Available Doctor';

  const formattedDate = details.date
    ? format(new Date(details.date), 'MMMM d, yyyy')
    : 'N/A';

  const formattedTime = details.time ? formatTime(details.time.time) : 'N/A';

  return (
    <div className="text-center">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
        <Check size={32} />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-800 mt-4">
        Appointment Confirmed!
      </h3>
      <p className="text-gray-600 mt-2">
        A confirmation has been sent to your email address.
      </p>

      {/* Summary Box */}
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

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between items-center">
        {/* Close Button */}
        <Button variant="ghost" size="md" icon={ArrowLeft} onClick={onClose}>
          Close
        </Button>

        {/* Book Another Button */}
        <Button variant="primary" size="md" className="px-8" onClick={onReset}>
          Book Another Appointment
        </Button>
      </div>
    </div>
  );
};
