import { useState } from 'react';
import Spinner from '../generic/Spinner';

// A simple modal component for the Terms and Conditions
const TermsModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
      <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
      <div className="space-y-4 text-sm text-gray-600 max-h-80 overflow-y-auto">
        <p>
          Welcome to our application. By registering, you agree to be bound by
          these Terms and Conditions. Please read them carefully.
        </p>
        <p>
          <strong>1. Account Responsibility:</strong> You are responsible for
          maintaining the confidentiality of your account and password and for
          restricting access to your computer.
        </p>
        <p>
          <strong>2. User Conduct:</strong> You agree not to use the service for
          any unlawful purpose or any purpose prohibited under this clause.
        </p>
        <p>
          <strong>3. Data Privacy:</strong> We are committed to protecting your
          privacy. Your personal information will be handled in accordance with
          our Privacy Policy.
        </p>
        <p>
          <strong>4. Termination:</strong> We may terminate or suspend your
          account at any time, without prior notice or liability, for any
          reason, including breach of these Terms.
        </p>
      </div>
      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#172554] hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#172554]"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const RegistrationForm = ({
  formData,
  onChange,
  onSubmit,
  disabled,
  isSubmitting,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handle = e => onChange(e);

  const handleFormSubmit = e => {
    e.preventDefault();
    if (!termsAccepted) {
      alert('You must accept the terms and conditions to register.');
      return;
    }
    onSubmit(e);
  };

  return (
    <>
      {isModalOpen && <TermsModal onClose={() => setIsModalOpen(false)} />}
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        {[
          'lastname',
          'firstname',
          'middlename',
          'email',
          'password',
          'confirmPassword',
        ].map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type={
                field === 'password' || field === 'confirmPassword'
                  ? 'password'
                  : field === 'email'
                  ? 'email'
                  : 'text'
              }
              placeholder={field === 'middlename' ? 'optional' : ''}
              name={field}
              value={formData[field]}
              onChange={handle}
              required={field !== 'middlename'}
              autoComplete={field.includes('password') ? 'new-password' : 'off'}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#172554] focus:border-[#172554] sm:text-sm"
            />
          </div>
        ))}

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 text-[#172554] focus:ring-[#172554] border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              Terms and Conditions
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={disabled || isSubmitting || !termsAccepted}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#172554] hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#172554] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Spinner /> Sending...
            </>
          ) : (
            'Register and Verify'
          )}
        </button>
      </form>
    </>
  );
};

export default RegistrationForm;
