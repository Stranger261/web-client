import { Link } from 'react-router';

const HomeSection = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-800 leading-tight mb-4">
        Your Health is Our Priority
      </h1>
      <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Providing compassionate care and advanced medical services to our
        community.
      </p>
      <Link
        to="/register"
        className="bg-[#172554] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-sky-700 transition-colors shadow-lg transform hover:scale-105"
      >
        Register now!
      </Link>
    </div>
  );
};

export default HomeSection;
