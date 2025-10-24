const MissionVisionSection = () => {
  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-gray-800 mb-12">
        Our Vision & Mission
      </h2>
      <div className="flex flex-col md:flex-row md:space-x-12 space-y-8 md:space-y-0">
        <div className="md:w-1/2 p-8 rounded-3xl shadow-lg bg-slate-50">
          <i className="fas fa-eye text-[#172554] text-6xl mb-4"></i>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
          <p className="text-gray-600 text-left my-3">
            To provide reliable, accessible and quality technological advances
            in diagnostic and therapeutic interventions in its lowest possible
            cost.
          </p>

          <p className="text-gray-600 text-left my-3">
            To promote respect on human dignity to every member of the
            institution and instill the spirit of meaningful community
            involvement illuminated by faith.
          </p>

          <p className="text-gray-600 text-left my-3">
            To render health awareness, promotion, prevention and rehabilitation
            among the community.
          </p>
        </div>
        <div className="md:w-1/2 p-8 rounded-3xl shadow-lg bg-slate-50">
          <i className="fas fa-bullseye text-[#172554] text-6xl mb-4"></i>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
          <p className="text-gray-600">
            To render excellent and committed professional health care services
            to the community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionVisionSection;
