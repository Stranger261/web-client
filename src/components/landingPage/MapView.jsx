import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { LEAFLET } from '../../configs/CONST';

const { HOSPITAL_COORDS, ZOOM_LEVEL } = LEAFLET;
// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// Custom hospital icon - building with cross
const hospitalIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <!-- Shadow -->
      <ellipse cx="24" cy="46" rx="12" ry="2" fill="black" opacity="0.2"/>
      
      <!-- Building -->
      <rect x="10" y="18" width="28" height="26" fill="#1e40af" stroke="#1e3a8a" stroke-width="1.5"/>
      
      <!-- Roof -->
      <path d="M 8 18 L 24 8 L 40 18 Z" fill="#1e3a8a"/>
      
      <!-- Cross on building -->
      <rect x="21" y="22" width="6" height="14" fill="white" rx="1"/>
      <rect x="16" y="27" width="16" height="6" fill="white" rx="1"/>
      
      <!-- Windows -->
      <rect x="14" y="24" width="4" height="4" fill="#dbeafe" opacity="0.8"/>
      <rect x="30" y="24" width="4" height="4" fill="#dbeafe" opacity="0.8"/>
      <rect x="14" y="35" width="4" height="4" fill="#dbeafe" opacity="0.8"/>
      <rect x="30" y="35" width="4" height="4" fill="#dbeafe" opacity="0.8"/>
      
      <!-- Door -->
      <rect x="20" y="38" width="8" height="6" fill="#172554" rx="1"/>
    </svg>
  `),
  iconSize: [48, 48],
  iconAnchor: [24, 46],
  popupAnchor: [0, -46],
});

// Custom user location icon - profile in circle
const userIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <!-- Outer glow -->
      <circle cx="20" cy="20" r="18" fill="#3b82f6" opacity="0.2"/>
      
      <!-- Main circle -->
      <circle cx="20" cy="20" r="15" fill="#3b82f6" stroke="white" stroke-width="3"/>
      
      <!-- Profile icon -->
      <circle cx="20" cy="16" r="5" fill="white"/>
      <path d="M 10 28 Q 10 22 20 22 Q 30 22 30 28 L 30 30 Q 30 30 20 30 Q 10 30 10 30 Z" fill="white"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Component to handle map animations
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);

  return null;
};

const MapView = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(HOSPITAL_COORDS);
  const [mapZoom, setMapZoom] = useState(ZOOM_LEVEL);
  const [isLocating, setIsLocating] = useState(false);

  const locateUser = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        const userPos = [latitude, longitude];
        setUserLocation(userPos);
        setMapCenter(userPos);
        setMapZoom(15);
        setIsLocating(false);

        // Debug: log coordinates
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        console.log(`Location accuracy: ${Math.round(accuracy)} meters`);
      },
      err => {
        console.warn('Geolocation error:', err.message);
        alert('Unable to get your location. Please enable location services.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const goToHospital = () => {
    setMapCenter(HOSPITAL_COORDS);
    setMapZoom(15);
  };

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-lg">
      <MapContainer
        center={HOSPITAL_COORDS}
        zoom={ZOOM_LEVEL}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <MapController center={mapCenter} zoom={mapZoom} />

        <Marker position={HOSPITAL_COORDS} icon={hospitalIcon}>
          <Popup>
            <div className="font-semibold">HVill Hospital</div>
            <div className="text-sm text-gray-600">Main Location</div>
          </Popup>
        </Marker>

        {userLocation && (
          <>
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="font-semibold">Your Location</div>
              </Popup>
            </Marker>
            <Polyline
              positions={[userLocation, HOSPITAL_COORDS]}
              color="#3b82f6"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          </>
        )}
      </MapContainer>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          onClick={locateUser}
          disabled={isLocating}
          className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-lg shadow-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocating ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Locating...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Locate Me</span>
            </>
          )}
        </button>

        <button
          onClick={goToHospital}
          className="bg-blue-900 hover:bg-blue-950 text-white font-medium py-2 px-4 rounded-lg shadow-md flex items-center gap-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Hospital</span>
        </button>
      </div>
    </div>
  );
};

export default MapView;
