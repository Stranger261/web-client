import DoctorCard from './DoctorCard';

const DoctorsSection = ({ doctors }) => {
  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Our Medical Experts
      </h2>
      <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
        Meet the compassionate and dedicated professionals who are here to serve
        you.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {doctors.map(doc => (
          <DoctorCard
            key={doc._id}
            name={`${doc.firstname} ${doc.lastname}`}
            specialty={doc.specialization}
            bio={doc.bio}
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorsSection;
