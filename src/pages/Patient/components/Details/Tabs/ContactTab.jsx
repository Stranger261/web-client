import { Phone, Mail, User, Users, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { EditableField } from '../EditableField';
import { AddressSection } from '../Sections/AddressSection';
import { RELATIONSHIP_OPTIONS } from '../constants/patientConstants';
import { normalizedWord } from '../../../../../utils/normalizedWord';

export const ContactTab = ({
  patientData,
  onFieldUpdate,
  onFieldsUpdate,
  isDarkMode = false,
}) => {
  return (
    <div>
      <div
        className={`flex items-center gap-3 mb-6 pb-4 border-b transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div
          className={`p-3 rounded-xl ${
            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}
        >
          <Phone size={24} style={{ color: COLORS.primary }} />
        </div>
        <div>
          <h3
            className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Contact & Emergency
          </h3>
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
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
          isDarkMode={isDarkMode}
        />

        {/* MOBILE NUMBER with phone validation */}
        <EditableField
          label="Mobile Number"
          value={patientData.contact_number}
          onSave={onFieldUpdate('contact_number')}
          fieldType="phone"
          countryCode="+63"
          icon={Phone}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Address Section */}
      <AddressSection
        patientData={patientData.address}
        onFieldsUpdate={onFieldsUpdate}
        isDarkMode={isDarkMode}
      />

      {/* Emergency Contact */}
      <div
        className={`pt-6 border-t transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <h4
          className={`text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
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
            isDarkMode={isDarkMode}
          />

          <EditableField
            label="Relationship"
            value={normalizedWord(patientData.emergency_contact_relation)}
            onSave={onFieldUpdate('emergency_contact_relation')}
            type="select"
            options={RELATIONSHIP_OPTIONS}
            icon={Users}
            isDarkMode={isDarkMode}
          />

          {/* EMERGENCY CONTACT PHONE with validation */}
          <EditableField
            label="Contact Number"
            value={patientData.emergency_contact_number}
            onSave={onFieldUpdate('emergency_contact_number')}
            fieldType="phone"
            countryCode="+63"
            icon={Phone}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};
