import { Clock, AlertCircle, User, Stethoscope, FileText } from 'lucide-react';

const ERPatientCard = ({
  visit,
  onTriage,
  onTreatment,
  onIdentify,
  onViewDetails,
}) => {
  const getTriageConfig = level => {
    const configs = {
      1: {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgLight: 'bg-red-50',
        label: 'Critical',
      },
      2: {
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgLight: 'bg-orange-50',
        label: 'Emergency',
      },
      3: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgLight: 'bg-yellow-50',
        label: 'Urgent',
      },
      4: {
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgLight: 'bg-green-50',
        label: 'Less Urgent',
      },
      5: {
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgLight: 'bg-blue-50',
        label: 'Non-Urgent',
      },
    };
    return configs[level] || configs[5];
  };

  const triageConfig = getTriageConfig(visit.triage_level);
  const isUnknown = visit.patient?.mrn?.startsWith('TEMP-');

  const waitingMinutes = visit.current_waiting_time || 0;
  const waitingHours = Math.floor(waitingMinutes / 60);
  const remainingMinutes = waitingMinutes % 60;

  const formatWaitTime = () => {
    if (waitingHours > 0) return `${waitingHours}h ${remainingMinutes}m`;
    return `${waitingMinutes} min`;
  };

  const getBorderColor = level => {
    const colors = {
      1: 'border-l-red-500',
      2: 'border-l-orange-500',
      3: 'border-l-yellow-500',
      4: 'border-l-green-500',
      5: 'border-l-blue-500',
    };
    return colors[level] || 'border-l-gray-500';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 
      border-l-4 ${getBorderColor(visit.triage_level)} min-w-0`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded shrink-0">
              {visit.er_number}
            </span>

            {isUnknown && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium shrink-0">
                🔍 Unknown
              </span>
            )}
          </div>

          <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2 min-w-0">
            <User size={18} className="text-gray-400 shrink-0" />
            <span className="truncate">
              {visit.patient?.person?.first_name || 'Unknown'}{' '}
              {visit.patient?.person?.last_name || 'Patient'}
            </span>
          </h3>

          {visit.patient?.mrn && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              MRN: {visit.patient.mrn}
            </p>
          )}
        </div>

        {/* Triage Badge */}
        <div className="flex flex-col items-center ml-3 shrink-0">
          <div
            className={`w-14 h-14 rounded-full ${triageConfig.color} 
            flex items-center justify-center text-white font-bold text-xl shadow-md`}
          >
            {visit.triage_level}
          </div>
          <span
            className={`text-xs mt-1 font-medium ${triageConfig.textColor}`}
          >
            {triageConfig.label}
          </span>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg min-w-0">
        <div className="flex items-start gap-2 min-w-0">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">
              Chief Complaint:
            </p>
            <p className="text-gray-800 text-sm mt-1 break-words">
              {visit.chief_complaint || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm min-w-0">
        <div className="flex items-center gap-2 text-gray-600 min-w-0">
          <Clock size={14} className="text-orange-500 shrink-0" />
          <span className="font-medium truncate">
            Waiting: <span className="text-gray-800">{formatWaitTime()}</span>
          </span>
        </div>

        <div className="text-gray-600 truncate">
          <span className="font-medium">Arrival:</span>{' '}
          <span className="text-gray-800 capitalize">
            {visit.arrival_mode?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
          ${
            visit.er_status === 'waiting'
              ? 'bg-orange-100 text-orange-800'
              : visit.er_status === 'in_treatment'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {visit.er_status === 'waiting' && '⏳ '}
          {visit.er_status === 'in_treatment' && '💊 '}
          {visit.er_status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 min-w-0">
        {visit.er_status === 'waiting' && (
          <>
            <button
              onClick={() => onTriage(visit)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
              bg-blue-500 text-white rounded-lg hover:bg-blue-600 
              transition-colors text-sm font-medium shadow-sm min-w-0"
            >
              <Stethoscope size={16} />
              Triage
            </button>

            {isUnknown && (
              <button
                onClick={() => onIdentify(visit)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
                bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 
                transition-colors text-sm font-medium shadow-sm min-w-0"
              >
                <User size={16} />
                Identify
              </button>
            )}
          </>
        )}

        {visit.er_status === 'in_treatment' && (
          <button
            onClick={() => onTreatment(visit)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 
            bg-green-500 text-white rounded-lg hover:bg-green-600 
            transition-colors text-sm font-medium shadow-sm min-w-0"
          >
            <Stethoscope size={16} />
            Add Treatment
          </button>
        )}

        {/* <button
          onClick={() => onViewDetails(visit)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 
          border-2 border-gray-300 rounded-lg hover:bg-gray-50 
          transition-colors text-sm font-medium text-gray-700 min-w-0"
        >
          <FileText size={16} />
          Details
        </button> */}
      </div>

      {/* Accompanied By */}
      {visit.accompanied_by && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 truncate">
            <span className="font-medium">Accompanied by:</span>{' '}
            {visit.accompanied_by}
          </p>
        </div>
      )}
    </div>
  );
};

export default ERPatientCard;
