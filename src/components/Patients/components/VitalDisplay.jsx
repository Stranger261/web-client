import { Activity, AlertCircle, Droplet, Heart } from 'lucide-react';
import { COLORS } from '../../../configs/CONST';

export const VitalsDisplay = ({ vitals, isDarkMode }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
    {[
      { label: 'BP', value: vitals?.blood_pressure, unit: '', icon: Heart },
      { label: 'HR', value: vitals?.heart_rate, unit: 'bpm', icon: Activity },
      {
        label: 'Temp',
        value: vitals?.temperature,
        unit: '°C',
        icon: AlertCircle,
      },
      {
        label: 'RR',
        value: vitals?.respiratory_rate,
        unit: '/min',
        icon: Activity,
      },
      {
        label: 'SpO2',
        value: vitals?.oxygen_saturation,
        unit: '%',
        icon: Droplet,
      },
    ].map(vital => {
      const Icon = vital.icon;
      return (
        <div
          key={vital.label}
          className="text-center p-2 sm:p-3 rounded-lg"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f9fafb',
          }}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon size={12} style={{ color: COLORS.text.secondary }} />
            <div className="text-xs" style={{ color: COLORS.text.secondary }}>
              {vital.label}
            </div>
          </div>
          <div
            className="text-sm sm:text-base font-semibold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {vital.value || 'N/A'}{' '}
            {vital.value && <span className="text-xs">{vital.unit}</span>}
          </div>
        </div>
      );
    })}
  </div>
);
