import { Phone, Mail, User, Users, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { EditableField } from '../EditableField';
import { AddressSection } from '../Sections/AddressSection';
import { RELATIONSHIP_OPTIONS } from '../constants/patientConstants';
import { normalizedWord } from '../../../../../utils/normalizedWord';

export const ContactTab = ({ patientData, onFieldUpdate, onFieldsUpdate }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div>
      <div
        className="flex items-center gap-3 mb-6 pb-4 border-b"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div
          className="p-3 rounded-xl"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.primary + '20'
              : COLORS.primary + '15',
          }}
        >
          <Phone size={24} style={{ color: COLORS.primary }} />
        </div>
        <div>
          <h3
            className="text-xl font-bold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Contact & Emergency
          </h3>
          <p
            className="text-sm"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Contact details and emergency contacts
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* EMAIL with validation */}
        <EditableField
          label="Email Address"
          value={patientData.email}
          onSave={onFieldUpdate('email')}
          fieldType="email"
          icon={Mail}
        />

        {/* MOBILE NUMBER with phone validation */}
        <EditableField
          label="Mobile Number"
          value={patientData.contact_number}
          onSave={onFieldUpdate('contact_number')}
          fieldType="phone"
          countryCode="+63"
          icon={Phone}
        />

        {/* HOME PHONE with phone validation */}
        <EditableField
          label="Phone Number"
          value={patientData.phone}
          onSave={onFieldUpdate('phone')}
          fieldType="phone"
          countryCode="+63"
          icon={Phone}
        />
      </div>

      {/* Address Section */}
      <AddressSection
        patientData={patientData.address}
        onFieldsUpdate={onFieldsUpdate}
      />

      {/* Emergency Contact */}
      <div
        className="pt-6 border-t"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <h4
          className="text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          <AlertCircle size={16} style={{ color: COLORS.danger }} />
          Emergency Contact
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            label="Contact Name"
            value={patientData.emergency_contact_name}
            onSave={onFieldUpdate('emergency_contact_name')}
            icon={User}
          />

          <EditableField
            label="Relationship"
            value={normalizedWord(patientData.emergency_contact_relation)}
            onSave={onFieldUpdate('emergency_contact_relation')}
            type="select"
            options={RELATIONSHIP_OPTIONS}
            icon={Users}
          />

          {/* EMERGENCY CONTACT PHONE with validation */}
          <EditableField
            label="Contact Number"
            value={patientData.emergency_contact_number}
            onSave={onFieldUpdate('emergency_contact_number')}
            fieldType="phone"
            countryCode="+63"
            icon={Phone}
          />
        </div>
      </div>
    </div>
  );
};
