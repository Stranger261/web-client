const StatsCard = ({
  title,
  value,
  icon: Icon,
  bgColor = 'bg-primary',
  textColor = 'text-primary-content',
}) => {
  return (
    <div className={`${bgColor} ${textColor} p-6 rounded-lg shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon size={32} className="opacity-80" />
      </div>
    </div>
  );
};

export default StatsCard;
