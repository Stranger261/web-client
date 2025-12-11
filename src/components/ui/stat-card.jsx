import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, change, icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green:
      'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple:
      'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange:
      'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
  };

  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`text-sm ml-1 ${
                isPositive ? changeColors.positive : changeColors.negative
              }`}
            >
              {isPositive ? '+' : ''}
              {change}% from last month
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
