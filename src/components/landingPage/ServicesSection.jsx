import ServiceCard from './ServiceCard';

const ServicesSection = () => {
  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Our Services
      </h2>
      <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
        We offer a wide range of specialized medical services to meet your
        needs.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ServiceCard
          iconClass="fas fa-heartbeat"
          title="Cardiology"
          description="Expert heart care using the latest diagnostic and treatment technologies."
        />
        <ServiceCard
          iconClass="fas fa-bone"
          title="Orthopedics"
          description="Specialized care for bones, joints, and muscular system injuries."
        />
        <ServiceCard
          iconClass="fas fa-child"
          title="Pediatrics"
          description="Compassionate and comprehensive healthcare for infants, children, and adolescents."
        />
        <ServiceCard
          iconClass="fas fa-brain"
          title="Neurology"
          description="Diagnosis and treatment for disorders of the nervous system."
        />
        <ServiceCard
          iconClass="fas fa-teeth"
          title="Dentistry"
          description="Comprehensive dental care for a healthy and confident smile."
        />
        <ServiceCard
          iconClass="fas fa-eye"
          title="Ophthalmology"
          description="Advanced eye care, from routine exams to complex surgeries."
        />
      </div>
    </div>
  );
};

export default ServicesSection;
