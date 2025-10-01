import { motion } from 'framer-motion';
import { useEffect } from 'react';

const SuccessModal = ({ data, onClose }) => {
  const handleOkayClick = () => {
    onClose();
    window.location.reload();
  };

  useEffect(() => {
    console.log('Modal opened with data:', data);
  }, [data]);

  // Remove the AnimatePresence from inside the modal
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center"
      >
        {/* Rest of your modal content */}
        <div className="flex items-center justify-center mb-4 text-green-500">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8.59l-9 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900">
          {data.message || 'Verification Successful'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Your identity has been successfully verified.
        </p>

        {/* Add null checks for data properties */}
        <div className="bg-gray-100 p-4 rounded-md text-left text-xs mb-6">
          <p className="font-semibold text-gray-800">Verification Details:</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-gray-700">
            <li>Confidence: {data?.confidence?.toFixed(2) || 'N/A'}%</li>
            <li>Threshold: {data?.threshold || 'N/A'}</li>
            <li>Result: {data?.data || 'VERIFIED'}</li>
            {data?.qualityInfo && (
              <>
                <li>
                  Brightness: {data.qualityInfo.brightness?.toFixed(2) || 'N/A'}
                </li>
                <li>
                  Sharpness: {data.qualityInfo.sharpness?.toFixed(2) || 'N/A'}
                </li>
              </>
            )}
          </ul>
        </div>

        <button
          onClick={handleOkayClick}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Okay
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SuccessModal;
