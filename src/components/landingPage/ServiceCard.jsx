const ServiceCard = ({ iconClass, title, description }) => (
  <div className="bg-slate-50 p-6 rounded-3xl shadow-md text-center transform hover:scale-105 transition-transform duration-300">
    <div className="text-[#172554] text-5xl mb-4">
      <i className={iconClass}></i>
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default ServiceCard;
