const StatusBanner = ({ message, isError }) => {
  if (!message) return null;
  return (
    <div
      className={`mt-6 p-4 rounded-lg text-sm font-medium ${
        isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}
    >
      {message}
    </div>
  );
};
export default StatusBanner;
