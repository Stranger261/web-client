import DoctorCard from '../Card/DoctorCard';

const DoctorsSection = () => {
  return (
    <>
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Our Medical Experts
      </h2>
      <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
        Meet the compassionate and dedicated professionals who are here to serve
        you.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <DoctorCard
          name="Dr. Alistair Finch"
          specialty="Cardiologist"
          bio="Dedicated to heart health with over 15 years of experience."
        />
        <DoctorCard
          name="Dr. Maya Sharma"
          specialty="Pediatrician"
          bio="Passionate about providing excellent care to young patients."
        />
        <DoctorCard
          name="Dr. James Carter"
          specialty="Orthopedic Surgeon"
          bio="A skilled surgeon specializing in joint and spine health."
        />
        <DoctorCard
          name="Dr. Sofia Miller"
          specialty="Neurologist"
          bio="Providing advanced care for complex neurological conditions."
        />
      </div>
    </>
  );
};

export default DoctorsSection;
