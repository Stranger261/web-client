import ContactItem from '../generic/ContactItem';

const ContactSection = () => {
  return (
    <>
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Contact Us
      </h2>
      <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
        Get in touch with us today with any questions you may have.
      </p>
      <div className="flex flex-col items-center">
        {/* Contact Information */}
        <div className="max-w-lg">
          <div className="space-y-6">
            <ContactItem
              iconClass="fas fa-map-marker-alt"
              title="Address"
              text="123 Health Parkway, Metropolis, CA 90210"
            />
            <ContactItem
              iconClass="fas fa-phone-alt"
              title="Phone"
              text="997-89-49/997-96-27/997-14-39"
            />
            <ContactItem
              iconClass="fab fa-facebook"
              title="Facebook"
              text="https://web.facebook.com/profile.php?id=100063816370233"
            />
            <ContactItem
              iconClass="fas fa-clock"
              title="Operating Hours"
              text={[
                'Mon - Fri: 8:00 AM - 6:00 PM',
                'Sat - Sun: 9:00 AM - 1:00 PM',
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactSection;
