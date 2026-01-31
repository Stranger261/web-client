// components/DoctorStatsPanel.jsx
import {
  X,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Clock,
  BarChart,
  TrendingDown,
} from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import { Button } from '../../ui/button';

const DoctorStatsPanel = ({ stats, isDarkMode, onClose }) => {
  if (!stats) return null;

  const statCards = [
    {
      icon: Users,
      label: 'Active Patients',
      value: stats.active_admissions || 0,
      color: COLORS.info,
      trend: '+2 this week',
      trendIcon: TrendingUp,
      trendColor: COLORS.success,
    },
    {
      icon: Calendar,
      label: 'Total This Month',
      value: stats.total_admissions || 0,
      color: COLORS.primary,
      trend: '+5 from last month',
      trendIcon: TrendingUp,
      trendColor: COLORS.success,
    },
    {
      icon: Target,
      label: 'Pending Discharge',
      value: stats.pending_discharges || 0,
      color: COLORS.warning,
      trend: 'Needs attention',
      trendIcon: TrendingUp,
      trendColor: COLORS.warning,
    },
    {
      icon: Clock,
      label: 'Avg Stay (Days)',
      value: Math.round(stats.avg_length_of_stay || 0),
      color: COLORS.success,
      trend: '-1 day trend',
      trendIcon: TrendingDown,
      trendColor: COLORS.danger,
    },
  ];

  const admissionTypes = stats.admission_types || [];

  return (
    <div
      className="p-3 sm:p-4 border-t"
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.dark
          : COLORS.surface.light,
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart className="w-5 h-5" style={{ color: COLORS.primary }} />
          <h3
            className="text-lg font-bold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Your Statistics
          </h3>
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: COLORS.primary + '20',
              color: COLORS.primary,
            }}
          >
            {stats.period || 'Month'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          onClick={onClose}
          className="w-8 h-8 p-0"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="p-2 sm:p-3 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.darkHover
                : COLORS.surface.lightHover,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.color + '20' }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="flex items-center gap-1">
                <stat.trendIcon
                  className="w-3 h-3"
                  style={{ color: stat.trendColor }}
                />
                <span className="text-xs" style={{ color: stat.trendColor }}>
                  {stat.trend}
                </span>
              </div>
            </div>
            <p
              className="text-lg sm:text-xl font-bold mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Admission Types Breakdown */}
      {admissionTypes.length > 0 && (
        <div className="mb-3">
          <h4
            className="text-sm font-bold mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Admission Types
          </h4>
          <div className="space-y-1">
            {admissionTypes.map((type, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span style={{ color: COLORS.text.secondary }}>
                  {type.admission_type || 'Unknown'}
                </span>
                <span
                  className="font-medium"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {type.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="text-xs" style={{ color: COLORS.text.secondary }}>
        <p>
          Period: {new Date(stats.start_date).toLocaleDateString()} -{' '}
          {new Date(stats.end_date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default DoctorStatsPanel;
