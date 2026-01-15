import { Calendar, Clock, Pill, AlertCircle } from 'lucide-react';

import { COLORS } from '../../../../../configs/CONST';
import { formatDate } from '../../../../../utils/dateFormatter';
import { InfoRow } from '../InfoRow';
import { StatCard } from '../cards/StatCard';

const OverViewTab = ({ isDarkMode, patient, stats }) => {
  return (
    <div className="space-y-6">
      {/* Patient Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal Information */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <h3
            className="text-sm font-bold uppercase mb-3"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Personal Information
          </h3>
          <div className="space-y-1">
            <InfoRow
              label="Date of Birth"
              value={patient?.date_of_birth}
              isDarkMode={isDarkMode}
            />
            <InfoRow
              label="Gender"
              value={patient?.gender}
              isDarkMode={isDarkMode}
            />
            <InfoRow
              label="Blood Type"
              value={patient.blood_type}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Medical Information */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <h3
            className="text-sm font-bold uppercase mb-3"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Medical Information
          </h3>
          <div className="space-y-1">
            <InfoRow
              label="Height"
              value={patient.height ? `${patient.height} cm` : null}
            />
            <InfoRow
              label="Weight"
              value={patient.weight ? `${patient.weight} kg` : null}
            />
            <div className="flex justify-between items-center py-2">
              <span
                className="text-sm"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Status
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold"
                style={{
                  backgroundColor:
                    patient.patient_status === 'active' ? '#d1fae5' : '#fee2e2',
                  color:
                    patient.patient_status === 'active' ? '#065f46' : '#991b1b',
                }}
              >
                {patient.patient_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Calendar}
          label="Total Visits"
          value={stats.totalVisits}
          color={COLORS.primary}
        />
        <StatCard
          icon={Clock}
          label="Last Visit"
          value={stats.lastVisit ? formatDate(stats.lastVisit) : 'No visits'}
          color={COLORS.success}
        />
        <StatCard
          icon={Pill}
          label="Active Rx"
          value={stats.activePrescriptions}
          color={COLORS.danger}
        />
      </div>

      {/* Chronic Conditions */}
      {patient.chronic_conditions && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <h3
            className="text-sm font-bold uppercase mb-2 flex items-center gap-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            <AlertCircle size={16} />
            Chronic Conditions
          </h3>
          <p
            className="text-sm"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            {patient.chronic_conditions}
          </p>
        </div>
      )}
    </div>
  );
};

export default OverViewTab;
