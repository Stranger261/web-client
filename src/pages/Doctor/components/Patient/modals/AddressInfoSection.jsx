import Badge from '../../../../../components/ui/badge';
import Card, { CardBody } from '../../../../../components/ui/card';
import { COLORS } from '../../../../../configs/CONST';
import { formatAddress, formatLocation } from '../utils/patientHelpers';

const AddressInfoSection = ({ patient, isDarkMode }) => {
  if (!patient.addresses || patient.addresses.length === 0) {
    return null;
  }

  return (
    <div>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        Address Information
      </h3>
      <div className="space-y-3">
        {patient.addresses.map(address => (
          <Card key={address.address_id}>
            <CardBody>
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant={address.is_primary ? 'success' : 'default'}
                  className="capitalize"
                >
                  {address.address_type}
                </Badge>
                {address.is_primary && (
                  <span
                    className="text-xs"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Primary Address
                  </span>
                )}
                {address.is_verified && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {/* Street Address */}
                {(address.house_number ||
                  address.street_name ||
                  address.subdivision) && (
                  <div>
                    <p
                      className="text-xs"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Street Address
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {formatAddress(address)}
                    </p>
                  </div>
                )}

                {/* Location */}
                <div>
                  <p
                    className="text-xs"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Location
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {formatLocation(address)}
                    {address.region && `, ${address.region}`}
                  </p>
                </div>

                {/* Zip Code */}
                {address.zip_code && (
                  <div>
                    <p
                      className="text-xs"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Zip Code
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {address.zip_code}
                    </p>
                  </div>
                )}

                {/* Landmark */}
                {address.landmark && (
                  <div>
                    <p
                      className="text-xs"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Landmark
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {address.landmark}
                    </p>
                  </div>
                )}

                {/* Delivery Instructions */}
                {address.delivery_instructions && (
                  <div>
                    <p
                      className="text-xs"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Delivery Instructions
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {address.delivery_instructions}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddressInfoSection;
