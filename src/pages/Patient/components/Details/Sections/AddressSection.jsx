import { useState, useEffect } from 'react';
import { Home, MapPin, Edit2 } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { AddressInfoForm } from '../../registration/address-info-form';
import { addressAPI } from '../../../../../services/addressApi';

export const AddressSection = ({ patientData, onFieldsUpdate }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const [isEditing, setIsEditing] = useState(false);
  const [addressNames, setAddressNames] = useState({
    region: '',
    province: '',
    city: '',
    barangay: '',
  });

  const [addressData, setAddressData] = useState({
    house_number: patientData.house_number || '',
    block_number: patientData.block_number || '',
    lot_number: patientData.lot_number || '',
    building_name: patientData.building_name || '',
    floor_unit: patientData.unit_floor || '',
    subdivision_village: patientData.subdivision || '',
    street: patientData.street_name || '',
    region_code: patientData.region_code || '',
    province_code: patientData.province_code || '',
    city_code: patientData.city_code || '',
    barangay_code: patientData.barangay_code || '',
    postal_code: patientData.zip_code || '',
    address_notes: patientData.address_notes || '',
  });

  // Fetch address names on mount
  useEffect(() => {
    if (patientData.region_code) {
      fetchAddressNames();
    }
  }, [
    patientData.region_code,
    patientData.province_code,
    patientData.city_code,
    patientData.barangay_code,
  ]);

  const fetchAddressNames = async () => {
    try {
      // Fetch region name
      if (patientData.region_code) {
        const regionsResponse = await addressAPI.getRegions();
        let regions = [];
        if (regionsResponse?.success && Array.isArray(regionsResponse.data)) {
          regions = regionsResponse.data;
        } else if (Array.isArray(regionsResponse)) {
          regions = regionsResponse;
        }
        const region = regions.find(
          r => r.region_code === patientData.region_code
        );
        if (region)
          setAddressNames(prev => ({ ...prev, region: region.region_name }));
      }

      // Fetch province name
      if (patientData.province_code) {
        const provincesResponse = await addressAPI.getProvinces(
          patientData.region_code
        );
        let provinces = [];
        if (
          provincesResponse?.success &&
          Array.isArray(provincesResponse.data)
        ) {
          provinces = provincesResponse.data;
        } else if (Array.isArray(provincesResponse)) {
          provinces = provincesResponse;
        }
        const province = provinces.find(
          p => p.province_code === patientData.province_code
        );
        if (province)
          setAddressNames(prev => ({
            ...prev,
            province: province.province_name,
          }));
      }

      // Fetch city name
      if (patientData.city_code) {
        const citiesResponse = await addressAPI.getCities(
          patientData.province_code
        );
        let cities = [];
        if (citiesResponse?.success && Array.isArray(citiesResponse.data)) {
          cities = citiesResponse.data;
        } else if (Array.isArray(citiesResponse)) {
          cities = citiesResponse;
        }
        const city = cities.find(c => c.city_code === patientData.city_code);
        if (city) setAddressNames(prev => ({ ...prev, city: city.city_name }));
      }

      // Fetch barangay name
      if (patientData.barangay_code) {
        const barangaysResponse = await addressAPI.getBarangays(
          patientData.city_code
        );
        let barangays = [];
        if (
          barangaysResponse?.success &&
          Array.isArray(barangaysResponse.data)
        ) {
          barangays = barangaysResponse.data;
        } else if (Array.isArray(barangaysResponse)) {
          barangays = barangaysResponse;
        }
        const barangay = barangays.find(
          b => b.barangay_code === patientData.barangay_code
        );
        if (barangay)
          setAddressNames(prev => ({
            ...prev,
            barangay: barangay.barangay_name,
          }));
      }
    } catch (error) {
      console.error('Failed to fetch address names:', error);
    }
  };

  const handleAddressChange = updates => {
    setAddressData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    try {
      await onFieldsUpdate(addressData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handleCancel = () => {
    setAddressData({
      house_number: patientData.house_number || '',
      block_number: patientData.block_number || '',
      lot_number: patientData.lot_number || '',
      building_name: patientData.building_name || '',
      floor_unit: patientData.unit_floor || '',
      subdivision_village: patientData.subdivision || '',
      street: patientData.street_name || '',
      region_code: patientData.region_code || '',
      province_code: patientData.province_code || '',
      city_code: patientData.city_code || '',
      barangay_code: patientData.barangay_code || '',
      postal_code: patientData.zip_code || '',
      address_notes: patientData.address_notes || '',
    });
    setIsEditing(false);
  };

  // Build complete address string
  const buildAddressLine = () => {
    const parts = [];

    if (addressData.house_number) parts.push(`#${addressData.house_number}`);
    if (addressData.block_number)
      parts.push(`Block ${addressData.block_number}`);
    if (addressData.lot_number) parts.push(`Lot ${addressData.lot_number}`);
    if (addressData.floor_unit) parts.push(addressData.floor_unit);
    if (addressData.building_name) parts.push(addressData.building_name);
    if (addressData.subdivision_village)
      parts.push(addressData.subdivision_village);
    if (addressData.street) parts.push(addressData.street);

    return parts.join(', ');
  };

  const addressLine = buildAddressLine();

  return (
    <div
      className="mb-8 rounded-lg border overflow-hidden"
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.dark
          : COLORS.surface.light,
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.primary + '20'
                : COLORS.primary + '15',
            }}
          >
            <Home size={20} style={{ color: COLORS.primary }} />
          </div>
          <h4
            className="font-semibold text-base"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Address Information
          </h4>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: COLORS.primary, color: '#ffffff' }}
          >
            <Edit2 size={14} />
            Edit Address
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {!isEditing ? (
          // Display Mode - Formatted address
          <div>
            {!addressData.region_code ? (
              <div className="text-center py-8">
                <MapPin
                  size={48}
                  className="mx-auto mb-3 opacity-30"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                />
                <p
                  className="text-sm"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  No address specified yet
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: COLORS.primary, color: '#ffffff' }}
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Street Address */}
                {addressLine && (
                  <div>
                    <p
                      className="text-xs uppercase tracking-wide mb-1"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Street Address
                    </p>
                    <p
                      className="text-base"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {addressLine}
                    </p>
                  </div>
                )}

                {/* Barangay, City, Province */}
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Location
                  </p>
                  <div
                    className="flex items-center gap-2 text-base"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    <MapPin size={16} style={{ color: COLORS.primary }} />
                    <span>
                      {addressNames.barangay &&
                        `Brgy. ${addressNames.barangay}, `}
                      {addressNames.city && `${addressNames.city}, `}
                      {addressNames.province && `${addressNames.province}, `}
                      {addressNames.region}
                    </span>
                  </div>
                </div>

                {/* Postal Code */}
                {addressData.postal_code && (
                  <div>
                    <p
                      className="text-xs uppercase tracking-wide mb-1"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Postal Code
                    </p>
                    <p
                      className="text-base font-mono"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {addressData.postal_code}
                    </p>
                  </div>
                )}

                {/* Additional Notes */}
                {addressData.address_notes && (
                  <div>
                    <p
                      className="text-xs uppercase tracking-wide mb-1"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Additional Notes
                    </p>
                    <p
                      className="text-sm italic"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      {addressData.address_notes}
                    </p>
                  </div>
                )}

                {/* Complete Address Summary */}
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.background.dark
                      : COLORS.background.main,
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-wide mb-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Complete Address
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {addressLine && `${addressLine}, `}
                    {addressNames.barangay &&
                      `Barangay ${addressNames.barangay}, `}
                    {addressNames.city}, {addressNames.province},{' '}
                    {addressNames.region}
                    {addressData.postal_code && ` ${addressData.postal_code}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Edit Mode - Use AddressInfoForm
          <AddressInfoForm
            data={addressData}
            onChange={handleAddressChange}
            onNext={handleSave}
            onBack={handleCancel}
          />
        )}
      </div>
    </div>
  );
};
