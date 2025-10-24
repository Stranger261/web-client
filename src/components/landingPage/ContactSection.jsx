import { GOOGLEMAPSURL, LEAFLET } from '../../configs/CONST';
import ContactItem from './ContactItem';
import MapView from './MapView';

const ContactSection = () => {
  return (
    <div className="w-full">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Contact Us
      </h2>
      <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
        Get in touch with us today with any questions you may have.
      </p>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[40%_60%] gap-10 items-start">
        {/* Contact Info */}
        <div className="space-y-6 flex flex-col justify-center">
          <a
            href={GOOGLEMAPSURL}
            target="_blank"
            rel="noopener noreferrer"
            className="block group hover:no-underline"
          >
            <ContactItem
              iconClass="fas fa-map-marker-alt group-hover:text-blue-700 transition-colors"
              title="Address"
              text={
                <span className="text-blue-600 underline group-hover:text-blue-800">
                  {LEAFLET.HOSPITALADDRESS}
                </span>
              }
            />
          </a>
          <ContactItem
            iconClass="fas fa-phone-alt"
            title="Phone"
            text="(02) 997 8949"
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

        {/* Map */}
        <MapView />
      </div>
    </div>
  );
};

export default ContactSection;
