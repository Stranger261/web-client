import Badge from '../../../../../components/ui/badge';
import { COLORS } from '../../../../../configs/CONST';

const ContactInfoSection = ({ patient, isDarkMode }) => {
  return (
    <div>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        Contact Information
      </h3>
      <div className="space-y-4">
        {/* Primary Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p
              className="text-sm"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Phone
            </p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patient.phone}
            </p>
          </div>
          <div>
            <p
              className="text-sm"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Email
            </p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patient.email}
            </p>
          </div>
        </div>

        {/* Emergency Contacts */}
        {patient.contacts && patient.contacts.length > 0 && (
          <div className="mt-4">
            <p
              className="text-sm font-semibold mb-3"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Emergency Contacts
            </p>
            <div className="space-y-3">
              {patient.contacts.map(contact => (
                <div
                  key={contact.contact_id}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.background.dark
                      : COLORS.background.light,
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={contact.is_primary ? 'success' : 'warning'}>
                      {contact.contact_type}
                    </Badge>
                    {contact.relationship && (
                      <span
                        className="text-xs capitalize"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        {contact.relationship}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {contact.contact_name && (
                      <div>
                        <p
                          className="text-xs"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Name
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {contact.contact_name}
                        </p>
                      </div>
                    )}
                    <div>
                      <p
                        className="text-xs"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        Phone
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        {contact.contact_number}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInfoSection;
