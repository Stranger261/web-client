import Spinner from '../generic/Spinner';

const RegistrationForm = ({
  formData,
  onChange,
  onSubmit,
  disabled,
  isSubmitting,
}) => {
  const handle = e => onChange(e);

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {['fullname', 'username', 'email', 'password', 'confirmPassword'].map(
        field => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type={
                field.includes('password')
                  ? 'password'
                  : field === 'confirmPassword'
                  ? 'password'
                  : field === 'email'
                  ? 'email'
                  : 'text'
              }
              name={field}
              value={formData[field]}
              onChange={handle}
              required
              autoComplete={field.includes('password') ? 'new-password' : 'off'}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#172554] focus:border-[#172554] sm:text-sm"
            />
          </div>
        )
      )}
      <button
        type="submit"
        disabled={disabled || isSubmitting}
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
  );
};

export default RegistrationForm;
