const TabButton = ({ active, icon: Icon, label, onClick, hasError }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm relative ${
      active
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
    }`}
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span className="hidden sm:inline">{label}</span>
    {hasError && (
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
    )}
  </button>
);

export default TabButton;
