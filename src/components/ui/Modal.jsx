import { motion, AnimatePresence } from 'framer-motion';

import { COLORS } from '../../configs/CONST';

const Modal = ({ isOpen, onClose, title, children }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="rounded-2xl shadow-xl w-full relative max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl p-4 sm:p-6"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              {title && (
                <h2
                  className="text-lg sm:text-xl font-semibold truncate"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="text-xl sm:text-2xl font-bold transition-colors"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = isDarkMode
                    ? COLORS.text.white
                    : COLORS.text.primary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = isDarkMode
                    ? COLORS.text.light
                    : COLORS.text.secondary;
                }}
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
