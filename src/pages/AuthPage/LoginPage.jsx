import { Link } from 'react-router';

const LoginPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        className="mx-auto h-12 w-auto"
        src="../../../public/images/logo.png"
        alt="St. Jude's Medical Logo"
      />
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl shadow-lg">
      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#172554] focus:border-[#172554] sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#172554] focus:border-[#172554] sm:text-sm"
              placeholder="********"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#172554] focus:ring-[#172554] border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-[#172554] hover:text-sky-600"
            >
              Forgot your password?
            </a>
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#172554] hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#172554]"
          >
            Log in
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Not a member?{' '}
        <Link
          to="/register"
          className="font-medium text-[#172554] hover:text-sky-600"
        >
          Sign up for an account
        </Link>
      </p>
      <p className="mt-6 text-center text-sm">
        <Link to="/" className="font-medium text-gray-600 hover:text-[#172554]">
          Back to Home
        </Link>
      </p>
    </div>
  </div>
);

export default LoginPage;
