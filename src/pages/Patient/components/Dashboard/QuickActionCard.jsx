import Card, { CardBody } from '../../../../components/ui/card';

const QuickActionButton = ({ icon: Icon, label, color = 'blue', onClick }) => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <button
      className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      onClick={onClick}
    >
      <div className={`p-3 rounded-lg mb-3 ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
};

const QuickActionsCard = ({
  title = 'Quick Actions',
  actions = [],
  columns = 2,
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <Card>
      <CardBody>
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        <div className={`grid gap-4 ${gridCols[columns]}`}>
          {actions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              label={action.label}
              color={action.color}
              onClick={action.onClick}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default QuickActionsCard;
