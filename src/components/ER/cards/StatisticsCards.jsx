import {
  Users,
  Clock,
  Activity,
  UserCheck,
  UserX,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

const StatisticsCards = ({ stats }) => {
  const statisticsConfig = [
    {
      title: 'Total Today',
      value: stats.totalToday || 0,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Waiting',
      value: stats.waiting || 0,
      icon: Clock,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'In Treatment',
      value: stats.inTreatment || 0,
      icon: Activity,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Admitted',
      value: stats.admitted || 0,
      icon: UserCheck,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Discharged',
      value: stats.discharged || 0,
      icon: UserX,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Critical Cases',
      value: stats.criticalCases || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600',
      highlight: true,
    },
    {
      title: 'Avg Wait Time',
      value: `${stats.averageWaitingTime || 0} min`,
      icon: TrendingUp,
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      isTime: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
      {statisticsConfig.map((stat, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow
                     ${stat.highlight ? 'ring-2 ring-red-200' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`${stat.lightColor} p-2 rounded-lg`}>
              <stat.icon size={20} className={stat.textColor} />
            </div>
            {stat.highlight && stat.value > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                Alert
              </span>
            )}
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
          </div>

          {stat.highlight && stat.value > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-red-600 font-medium">
                Requires immediate attention
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
