import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * A reusable, accessible, and animated modal component.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {string} [props.title] - Optional title to display in the modal header.
 * @param {React.ReactNode} props.children - The content to be displayed inside the modal.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Effect to handle the 'Escape' key press for closing the modal
  useEffect(() => {
    const handleEscape = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener when the modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    // Cleanup the event listener when the component unmounts or modal closes
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  // Prevent clicks inside the modal from closing it
  const handleModalContentClick = e => {
    e.stopPropagation();
  };

  return (
    // Backdrop: Covers the entire screen with a semi-transparent background
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300 animate-fadeIn"
      onClick={onClose} // Close modal when backdrop is clicked
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-transform duration-300 animate-scaleIn"
        onClick={handleModalContentClick} // Stop propagation to prevent closing
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
          {title && (
            <h2 id="modal-title" className="text-xl font-bold text-gray-800">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b1b3b] transition-all"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Where the main content goes */}
        <div className="p-6 flex-grow overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
