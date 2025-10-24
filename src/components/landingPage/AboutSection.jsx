const AboutSection = () => {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-6 mt-5">
        <h2 className="text-3xl font-semibold text-[#172554] mb-6">
          About HVill Hospital
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          At HVill Hospital, we are committed to providing the highest quality
          of healthcare with a focus on compassionate service. Our team of
          experienced doctors and medical staff works around the clock to ensure
          the well-being of our patients.
        </p>
        <img
          src="images/logo.png"
          alt="About HVill Hospital"
          className="mx-auto rounded-lg w-full max-w-md"
        />
      </div>
    </div>
  );
};

export default AboutSection;
