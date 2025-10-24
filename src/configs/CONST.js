export const LEAFLET = {
  HOSPITALADDRESS: '82 J. P. Rizal St., Manggahan 1860 Rodriguez, Philippines',
  HOSPITAL_COORDS: [14.72414951530476, 121.14176532431448],
  ZOOM_LEVEL: 15,
};
export const GOOGLEMAPSURL = `https://google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  LEAFLET.HOSPITALADDRESS
)}`;
