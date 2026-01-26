import { useState, useEffect } from 'react';
import {
  Home,
  MapPin,
  Edit2,
  Check,
  X,
  Navigation,
  Mailbox,
} from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import { addressAPI } from '../../../services/addressApi';

export const AddressSection = ({ addresses, isDarkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [addressNames, setAddressNames] = useState({
    region: '',
    province: '',
    city: '',
    barangay: '',
  });
  const [loading, setLoading] = useState(false);

  const primaryAddress =
    addresses?.find(addr => addr.is_primary) || addresses?.[0];

  // Fetch address names on mount
  useEffect(() => {
    if (primaryAddress?.region) {
      fetchAddressNames();
    }
  }, [primaryAddress]);

  const fetchAddressNames = async () => {
    if (!primaryAddress) return;

    setLoading(true);
    try {
      const { region, province, city, barangay } = primaryAddress;

      // Fetch region name
      if (region) {
        const regionsResponse = await addressAPI.getRegions();
        const regions = Array.isArray(regionsResponse?.data)
          ? regionsResponse.data
          : Array.isArray(regionsResponse)
            ? regionsResponse
            : [];

        const regionData = regions.find(r => r.region_code === region);
        if (regionData) {
          setAddressNames(prev => ({
            ...prev,
            region: regionData.region_name,
          }));
        }
      }

      // Fetch province name
      if (province) {
        const provincesResponse = await addressAPI.getProvinces(region);
        const provinces = Array.isArray(provincesResponse?.data)
          ? provincesResponse.data
          : Array.isArray(provincesResponse)
            ? provincesResponse
            : [];

        const provinceData = provinces.find(p => p.province_code === province);
        if (provinceData) {
          setAddressNames(prev => ({
            ...prev,
            province: provinceData.province_name,
          }));
        }
      }

      // Fetch city name
      if (city) {
        const citiesResponse = await addressAPI.getCities(province);
        const cities = Array.isArray(citiesResponse?.data)
          ? citiesResponse.data
          : Array.isArray(citiesResponse)
            ? citiesResponse
            : [];

        const cityData = cities.find(c => c.city_code === city);
        if (cityData) {
          setAddressNames(prev => ({ ...prev, city: cityData.city_name }));
        }
      }

      // Fetch barangay name
      if (barangay) {
        const barangaysResponse = await addressAPI.getBarangays(city);
        const barangays = Array.isArray(barangaysResponse?.data)
          ? barangaysResponse.data
          : Array.isArray(barangaysResponse)
            ? barangaysResponse
            : [];

        const barangayData = barangays.find(b => b.barangay_code === barangay);
        if (barangayData) {
          setAddressNames(prev => ({
            ...prev,
            barangay: barangayData.barangay_name,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch address names:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build address parts for display
  const buildAddressParts = () => {
    if (!primaryAddress) return [];

    const parts = [];

    // Building/Lot details
    if (primaryAddress.building_name) parts.push(primaryAddress.building_name);
    if (primaryAddress.house_number)
      parts.push(`#${primaryAddress.house_number}`);
    if (primaryAddress.unit_floor)
      parts.push(`Unit ${primaryAddress.unit_floor}`);

    // Street and subdivision
    if (primaryAddress.street_name) parts.push(primaryAddress.street_name);
    if (primaryAddress.subdivision) parts.push(primaryAddress.subdivision);
    if (primaryAddress.landmark) parts.push(`Near ${primaryAddress.landmark}`);

    return parts;
  };

  // Build complete address string
  const buildCompleteAddress = () => {
    const parts = buildAddressParts();

    if (addressNames.barangay) parts.push(`Barangay ${addressNames.barangay}`);
    if (addressNames.city) parts.push(addressNames.city);
    if (addressNames.province) parts.push(addressNames.province);
    if (addressNames.region) parts.push(addressNames.region);
    if (primaryAddress?.zip_code) parts.push(primaryAddress.zip_code);

    return parts.join(', ');
  };

  const addressParts = buildAddressParts();
  const completeAddress = buildCompleteAddress();

  if (!addresses || addresses.length === 0) {
    return (
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
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
        </div>

        <div className="p-8 text-center">
          <MapPin
            size={48}
            className="mx-auto mb-4 opacity-30"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          />
          <p
            className="text-sm mb-4"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            No address information available
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: COLORS.primary, color: '#ffffff' }}
          >
            Add Address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
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
          <div>
            <h4
              className="font-semibold text-base"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Address Information
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.primary + '20'
                    : COLORS.primary + '10',
                  color: COLORS.primary,
                }}
              >
                {primaryAddress.address_type === 'home'
                  ? 'Home Address'
                  : 'Other Address'}
              </span>
              {primaryAddress.is_primary && (
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: '#10b98120',
                    color: '#10b981',
                  }}
                >
                  Primary
                </span>
              )}
              {!primaryAddress.is_verified && (
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: '#f59e0b20',
                    color: '#f59e0b',
                  }}
                >
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() =>
                  window.open(
                    `https://maps.google.com/?q=${encodeURIComponent(completeAddress)}`,
                    '_blank',
                  )
                }
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: isDarkMode
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                }}
                title="Open in Google Maps"
              >
                <Navigation
                  size={18}
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ backgroundColor: COLORS.primary, color: '#ffffff' }}
              >
                <Edit2 size={14} />
                Edit
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: isDarkMode
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                }}
                title="Cancel"
              >
                <X size={18} style={{ color: COLORS.danger }} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ backgroundColor: COLORS.success, color: '#ffffff' }}
              >
                <Check size={14} />
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {isEditing ? (
          // Edit Mode - You can implement your form here
          <div className="space-y-4">
            <div className="text-center py-4">
              <p
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Address editing form will be implemented here
              </p>
            </div>
          </div>
        ) : (
          // Display Mode
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: COLORS.primary }}
                ></div>
              </div>
            ) : (
              <>
                {/* Address Type Badges */}
                <div className="flex flex-wrap gap-2">
                  {addresses.map((address, index) => (
                    <button
                      key={address.address_id}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        address.address_id === primaryAddress.address_id
                          ? 'ring-2 ring-offset-1'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor:
                          address.address_id === primaryAddress.address_id
                            ? COLORS.primary
                            : isDarkMode
                              ? 'rgba(255,255,255,0.1)'
                              : 'rgba(0,0,0,0.05)',
                        color:
                          address.address_id === primaryAddress.address_id
                            ? '#ffffff'
                            : isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                        borderColor:
                          address.address_id === primaryAddress.address_id
                            ? COLORS.primary
                            : 'transparent',
                      }}
                    >
                      {address.address_type === 'home' ? (
                        <>
                          <span>
                            <Home size={9} /> Home
                          </span>
                        </>
                      ) : (
                        <>Other</>
                      )}
                    </button>
                  ))}
                </div>

                {/* Street Address Details */}
                {addressParts.length > 0 && (
                  <div className="space-y-3">
                    <h5
                      className="text-sm font-medium uppercase tracking-wider"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Street Address
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {primaryAddress.house_number && (
                        <div className="space-y-1">
                          <span
                            className="text-xs"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            House Number
                          </span>
                          <p
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {primaryAddress.house_number}
                          </p>
                        </div>
                      )}
                      {primaryAddress.building_name && (
                        <div className="space-y-1">
                          <span
                            className="text-xs"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Building
                          </span>
                          <p
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {primaryAddress.building_name}
                          </p>
                        </div>
                      )}
                      {primaryAddress.unit_floor && (
                        <div className="space-y-1">
                          <span
                            className="text-xs"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Unit/Floor
                          </span>
                          <p
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {primaryAddress.unit_floor}
                          </p>
                        </div>
                      )}
                      {primaryAddress.street_name && (
                        <div className="space-y-1">
                          <span
                            className="text-xs"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Street
                          </span>
                          <p
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {primaryAddress.street_name}
                          </p>
                        </div>
                      )}
                      {primaryAddress.subdivision && (
                        <div className="space-y-1">
                          <span
                            className="text-xs"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Subdivision
                          </span>
                          <p
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {primaryAddress.subdivision}
                          </p>
                        </div>
                      )}
                      {primaryAddress.landmark && (
                        <div className="space-y-1">
                          <span
                            className="text-xs"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Landmark
                          </span>
                          <p
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {primaryAddress.landmark}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} style={{ color: COLORS.primary }} />
                    <h5
                      className="text-sm font-medium uppercase tracking-wider"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Location
                    </h5>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {addressNames.barangay && (
                      <div className="space-y-1">
                        <span
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Barangay
                        </span>
                        <p
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {addressNames.barangay}
                        </p>
                      </div>
                    )}
                    {addressNames.city && (
                      <div className="space-y-1">
                        <span
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          City/Municipality
                        </span>
                        <p
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {addressNames.city}
                        </p>
                      </div>
                    )}
                    {addressNames.province && (
                      <div className="space-y-1">
                        <span
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Province
                        </span>
                        <p
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {addressNames.province}
                        </p>
                      </div>
                    )}
                    {addressNames.region && (
                      <div className="space-y-1">
                        <span
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Region
                        </span>
                        <p
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {addressNames.region}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Postal Code */}
                {primaryAddress.zip_code && (
                  <div className="flex items-center gap-3">
                    <Mailbox
                      size={16}
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    />
                    <div className="space-y-1">
                      <span
                        className="text-xs"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        Postal Code
                      </span>
                      <p
                        className="text-base font-mono"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        {primaryAddress.zip_code}
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery Instructions */}
                {primaryAddress.delivery_instructions && (
                  <div
                    className="space-y-2 pt-4 border-t"
                    style={{
                      borderColor: isDarkMode
                        ? COLORS.border.dark
                        : COLORS.border.light,
                    }}
                  >
                    <span
                      className="text-xs uppercase tracking-wider"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Delivery Instructions
                    </span>
                    <p
                      className="text-sm italic"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      {primaryAddress.delivery_instructions}
                    </p>
                  </div>
                )}

                {/* Complete Address Preview */}
                <div
                  className="mt-6 p-4 rounded-lg border"
                  style={{
                    backgroundColor: isDarkMode
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  <h6
                    className="text-xs uppercase tracking-wider mb-3"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Complete Address
                  </h6>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {completeAddress}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer - Coordinates if available */}
      {primaryAddress.latitude && primaryAddress.longitude && (
        <div
          className="px-5 py-3 border-t text-xs"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          <span className="font-medium">Coordinates:</span>{' '}
          {primaryAddress.latitude.toFixed(6)},{' '}
          {primaryAddress.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
};
