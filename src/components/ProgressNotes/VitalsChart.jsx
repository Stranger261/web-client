import { useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Thermometer,
  Heart,
  Wind,
  Droplets,
} from 'lucide-react';
import { COLORS } from '../../configs/CONST';
import { LoadingSpinner } from '../ui/loading-spinner';

const VitalsChart = ({ vitals, loading }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [selectedVital, setSelectedVital] = useState('temperature');

  const vitalTypes = [
    {
      id: 'temperature',
      label: 'Temperature',
      icon: Thermometer,
      unit: '°C',
      color: COLORS.danger,
    },
    {
      id: 'blood_pressure',
      label: 'Blood Pressure',
      icon: Activity,
      unit: 'mmHg',
      color: COLORS.info,
    },
    {
      id: 'heart_rate',
      label: 'Heart Rate',
      icon: Heart,
      unit: 'bpm',
      color: COLORS.warning,
    },
    {
      id: 'respiratory_rate',
      label: 'Respiratory Rate',
      icon: Wind,
      unit: 'bpm',
      color: COLORS.success,
    },
    {
      id: 'oxygen_saturation',
      label: 'O2 Saturation',
      icon: Droplets,
      unit: '%',
      color: COLORS.purple,
    },
  ];

  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTrendIcon = change => {
    if (!change || change === 0)
      return <Minus size={16} style={{ color: COLORS.text.secondary }} />;
    if (change > 0)
      return <TrendingUp size={16} style={{ color: COLORS.success }} />;
    return <TrendingDown size={16} style={{ color: COLORS.danger }} />;
  };

  const getTrendColor = change => {
    if (!change || change === 0) return COLORS.text.secondary;
    if (change > 0) return COLORS.success;
    return COLORS.danger;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!vitals || vitals.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity
          className="w-12 h-12 mx-auto mb-3"
          style={{ color: COLORS.text.secondary }}
        />
        <p
          className="text-lg font-medium"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          No vital signs data
        </p>
        <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
          Vital signs will appear here once recorded
        </p>
      </div>
    );
  }

  const selectedVitalData = vitalTypes.find(v => v.id === selectedVital);
  const Icon = selectedVitalData.icon;

  return (
    <div className="space-y-4">
      {/* Vital Type Selector */}
      <div className="flex gap-2 flex-wrap">
        {vitalTypes.map(vital => {
          const VitalIcon = vital.icon;
          const isActive = selectedVital === vital.id;
          return (
            <button
              key={vital.id}
              onClick={() => setSelectedVital(vital.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
              style={{
                backgroundColor: isActive
                  ? vital.color + '20'
                  : isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.surface.lightHover,
                color: isActive ? vital.color : COLORS.text.secondary,
                border: `1px solid ${isActive ? vital.color : 'transparent'}`,
              }}
            >
              <VitalIcon size={16} />
              <span className="hidden sm:inline">{vital.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Header */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.darkHover
            : COLORS.surface.lightHover,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon size={20} style={{ color: selectedVitalData.color }} />
          <h3
            className="text-lg font-semibold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {selectedVitalData.label} Trend
          </h3>
        </div>
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          Showing {vitals.length} readings
        </p>
      </div>

      {/* Vitals Timeline */}
      <div className="space-y-2">
        {vitals.map((vital, index) => {
          let value, comparison;

          // Get value based on selected vital type
          switch (selectedVital) {
            case 'temperature':
              value = vital.temperature;
              comparison = vital.comparison?.temperature;
              break;
            case 'blood_pressure':
              value =
                vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                  ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                  : null;
              comparison = vital.comparison?.blood_pressure;
              break;
            case 'heart_rate':
              value = vital.heart_rate;
              comparison = vital.comparison?.heart_rate;
              break;
            case 'respiratory_rate':
              value = vital.respiratory_rate;
              comparison = vital.comparison?.respiratory_rate;
              break;
            case 'oxygen_saturation':
              value = vital.oxygen_saturation;
              comparison = vital.comparison?.oxygen_saturation;
              break;
            default:
              value = null;
          }

          if (!value) return null;

          const change = comparison?.change;
          const isLatest = index === 0;

          return (
            <div
              key={vital.note_id}
              className="p-4 rounded-lg border transition-all"
              style={{
                backgroundColor: isLatest
                  ? selectedVitalData.color + '10'
                  : isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                borderColor: isLatest
                  ? selectedVitalData.color
                  : isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                borderWidth: isLatest ? '2px' : '1px',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: selectedVitalData.color + '20',
                    }}
                  >
                    <Icon
                      size={24}
                      style={{ color: selectedVitalData.color }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className="text-2xl font-bold"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        {value}
                      </p>
                      <span
                        className="text-sm"
                        style={{ color: COLORS.text.secondary }}
                      >
                        {selectedVitalData.unit}
                      </span>
                      {isLatest && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: selectedVitalData.color + '20',
                            color: selectedVitalData.color,
                          }}
                        >
                          Latest
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm mt-1"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {formatDateTime(vital.note_date)}
                    </p>
                  </div>
                </div>

                {/* Trend Indicator */}
                {change !== null && change !== undefined && index > 0 && (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(change)}
                      <span
                        className="text-sm font-medium"
                        style={{ color: getTrendColor(change) }}
                      >
                        {Math.abs(change).toFixed(1)}
                        {selectedVital === 'blood_pressure'
                          ? ''
                          : selectedVitalData.unit}
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      vs previous
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Context */}
              {vital.consciousness_level && selectedVital === 'temperature' && (
                <div
                  className="mt-3 pt-3 border-t"
                  style={{
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Consciousness:{' '}
                    <span className="capitalize font-medium">
                      {vital.consciousness_level}
                    </span>
                  </p>
                </div>
              )}

              {vital.pain_level !== null &&
                vital.pain_level !== undefined &&
                selectedVital === 'heart_rate' && (
                  <div
                    className="mt-3 pt-3 border-t"
                    style={{
                      borderColor: isDarkMode
                        ? COLORS.border.dark
                        : COLORS.border.light,
                    }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      Pain Level:{' '}
                      <span className="font-medium">{vital.pain_level}/10</span>
                    </p>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div
        className="p-4 rounded-lg grid grid-cols-3 gap-4"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.darkHover
            : COLORS.surface.lightHover,
        }}
      >
        <div>
          <p className="text-xs" style={{ color: COLORS.text.secondary }}>
            Latest
          </p>
          <p
            className="text-lg font-bold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {(() => {
              const latest = vitals[0];
              switch (selectedVital) {
                case 'temperature':
                  return latest.temperature || 'N/A';
                case 'blood_pressure':
                  return latest.blood_pressure_systolic &&
                    latest.blood_pressure_diastolic
                    ? `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`
                    : 'N/A';
                case 'heart_rate':
                  return latest.heart_rate || 'N/A';
                case 'respiratory_rate':
                  return latest.respiratory_rate || 'N/A';
                case 'oxygen_saturation':
                  return latest.oxygen_saturation || 'N/A';
                default:
                  return 'N/A';
              }
            })()}
          </p>
        </div>

        <div>
          <p className="text-xs" style={{ color: COLORS.text.secondary }}>
            Readings
          </p>
          <p
            className="text-lg font-bold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {vitals.length}
          </p>
        </div>

        <div>
          <p className="text-xs" style={{ color: COLORS.text.secondary }}>
            Period
          </p>
          <p
            className="text-lg font-bold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {(() => {
              if (vitals.length < 2) return 'N/A';
              const first = new Date(vitals[vitals.length - 1].note_date);
              const last = new Date(vitals[0].note_date);
              const days = Math.ceil((last - first) / (1000 * 60 * 60 * 24));
              return `${days}d`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VitalsChart;
