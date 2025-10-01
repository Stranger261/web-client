import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="
              bg-white rounded-2xl shadow-xl w-full relative
              max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl
              p-4 sm:p-6
            "
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              {title && (
                <h2 className="text-lg sm:text-xl font-semibold truncate">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[70vh] sm:max-h-[80vh]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
