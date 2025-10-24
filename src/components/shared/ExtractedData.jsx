import {
  User,
  ShieldCheck,
  Calendar,
  MapPin,
  AlertTriangle,
  Badge, // Added for ID Type icon
} from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

const ExtractedData = ({ data, error, isOCRLoading }) => {
  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700">Extraction Failed</h2>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (isOCRLoading) return <LoadingOverlay />;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      <div className="text-center mb-6">
        <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-800">
          Kumpirmahin ang Iyong Impormasyon
        </h2>
        <p className="text-gray-600 mt-1">
          Pakisuri ang mga detalyeng nakuha mula sa iyong ID.
        </p>
      </div>

      <div className="space-y-5 border-t border-b border-gray-200 py-6">
        {/* --- ID Type (Added for better UX) --- */}
        <div className="flex items-center">
          <Badge className="w-5 h-5 text-gray-500 mr-4 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Uri ng ID (ID Type)</p>
            <p className="font-medium text-gray-800">{data.idType}</p>
          </div>
        </div>

        {/* --- Name Group (Properties Corrected) --- */}
        <div className="flex">
          <User className="w-5 h-5 text-gray-500 mr-4 flex-shrink-0 mt-1" />
          <div className="w-full">
            <p className="text-sm font-semibold text-gray-700">
              Buong Pangalan (Full Name)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 mt-2">
              <div>
                <label className="text-xs text-gray-500">Apelyido</label>
                <p className="font-medium text-gray-800">{data.lastname}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  Gitnang Apelyido
                </label>
                <p className="font-medium text-gray-800">{data.middlename}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Mga Pangalan</label>
                <p className="font-medium text-gray-800">{data.firstname}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Date of Birth (Property Corrected) --- */}
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-gray-500 mr-4 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">
              Petsa ng Kapanganakan (Date of Birth)
            </p>
            <p className="font-medium text-gray-800">{data.dateOfBirth}</p>
          </div>
        </div>

        {/* --- Address --- */}
        <div className="flex items-center">
          <MapPin className="w-5 h-5 text-gray-500 mr-4 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Tirahan (Address)</p>
            <p className="font-medium text-gray-800">{data.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtractedData;
