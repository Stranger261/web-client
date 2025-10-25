import { GOOGLEMAPSURL, LEAFLET } from '../../configs/CONST';
import ContactItem from './ContactItem';
import MapView from './MapView';

const ContactSection = () => {
  // Function to open Google Maps with proper mobile detection
  const openInMaps = () => {
    const address = encodeURIComponent(LEAFLET.HOSPITALADDRESS);
    const coords = `${LEAFLET.HOSPITAL_COORDS[0]},${LEAFLET.HOSPITAL_COORDS[1]}`;

    // Detect if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let mapsUrl;
    if (isMobile) {
      // For mobile, use geo: URL scheme which works across devices
      // Falls back to Google Maps if app not installed
      mapsUrl = `geo:${coords}?q=${coords}(HVill+Hospital)`;

      // Alternative: Open Google Maps app directly
      // For iOS
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        mapsUrl = `maps://maps.google.com/maps?q=${coords}&ll=${coords}`;
        // Fallback to web if app not installed
        setTimeout(() => {
          window.location.href = `https://maps.google.com/maps?q=${coords}`;
        }, 500);
      }
      // For Android
      else if (/Android/i.test(navigator.userAgent)) {
        mapsUrl = `geo:${coords}?q=${address}`;
      }
    } else {
      // For desktop, use standard Google Maps URL
      mapsUrl =
        GOOGLEMAPSURL ||
        `https://www.google.com/maps/search/?api=1&query=${coords}`;
    }

    window.open(mapsUrl, '_blank');
  };

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
          {/* Address with Click Handler for Mobile */}
          <button
            onClick={openInMaps}
            className="block group hover:no-underline text-left w-full"
          >
            <ContactItem
              iconClass="fas fa-map-marker-alt group-hover:text-blue-700 transition-colors"
              title="Address"
              text={
                <span className="text-blue-600 underline group-hover:text-blue-800">
                  {LEAFLET.HOSPITALADDRESS}
                  <br />
                  <span className="text-xs text-gray-500 mt-1 block">
                    (Tap to open in Maps)
                  </span>
                </span>
              }
            />
          </button>

          {/* Phone with tel: link for mobile */}
          <a href="tel:+6329978949" className="block group hover:no-underline">
            <ContactItem
              iconClass="fas fa-phone-alt group-hover:text-blue-700 transition-colors"
              title="Phone"
              text={
                <span className="text-blue-600 underline group-hover:text-blue-800">
                  (02) 997 8949
                  <br />
                  <span className="text-xs text-gray-500 mt-1 block">
                    (Tap to call)
                  </span>
                </span>
              }
            />
          </a>

          {/* Facebook Link */}
          <a
            href="https://web.facebook.com/profile.php?id=100063816370233"
            target="_blank"
            rel="noopener noreferrer"
            className="block group hover:no-underline"
          >
            <ContactItem
              iconClass="fab fa-facebook group-hover:text-blue-700 transition-colors"
              title="Facebook"
              text={
                <span className="text-blue-600 underline group-hover:text-blue-800">
                  Visit our Facebook Page
                  <br />
                  <span className="text-xs text-gray-500 mt-1 block">
                    (Tap to visit)
                  </span>
                </span>
              }
            />
          </a>

          {/* Operating Hours */}
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
