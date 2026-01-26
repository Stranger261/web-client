import { useState } from 'react';
import {
  Calendar,
  Clock,
  Pill,
  Phone,
  Mail,
  MapPin,
  User,
  Shield,
  Heart,
  Scale,
  Activity,
  FileText,
  AlertCircle,
  Home,
  Users,
  Ruler,
  Droplet,
  Thermometer,
  TrendingUp,
} from 'lucide-react';

import { COLORS } from '../../../configs/CONST';
import { formatDate } from '../../../utils/dateFormatter';
import { StatCard } from '../cards/StatCard';
import { AddressSection } from '../components/AddressSection';
import { calculateAge } from '../utils/patientHelpers';

const OverViewTab = ({ isDarkMode, patient, stats }) => {
  const age = calculateAge(patient.date_of_birth);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Section with Quick Stats */}
      <div
        className={`rounded-lg p-4 sm:p-6 border ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div className="space-y-4">
          {/* Patient Identity */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                <User
                  className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  size={20}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  className="text-xl sm:text-2xl font-bold break-words"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {patient.first_name}{' '}
                  {patient.middle_name && `${patient.middle_name} `}
                  {patient.last_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {patient.mrn}
                  </span>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${patient.patient_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {patient.patient_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <Mail
                  size={14}
                  className={`flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                />
                <span
                  className="text-xs sm:text-sm truncate"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  {patient.email}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Phone
                  size={14}
                  className={`flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                />
                <span
                  className="text-xs sm:text-sm truncate"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  {patient.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mobile: Full width cards with horizontal layout */}
            <div className="sm:hidden space-y-2">
              <div
                className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Calendar size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Visits</p>
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {stats.totalVisits || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Clock size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Visit</p>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {stats.lastVisit
                        ? formatDate(stats.lastVisit, 'short')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Pill size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Active Prescriptions
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {stats.activePrescriptions || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Original StatCard layout */}
            <div className="hidden sm:contents">
              <StatCard
                icon={Calendar}
                label="Visits"
                value={stats.totalVisits || 0}
                color={COLORS.primary}
              />
              <StatCard
                icon={Clock}
                label="Last Visit"
                value={
                  stats.lastVisit ? formatDate(stats.lastVisit, 'short') : 'N/A'
                }
                color={COLORS.success}
              />
              <StatCard
                icon={Pill}
                label="Rx"
                value={stats.activePrescriptions || 0}
                color={COLORS.danger}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div
        className={`rounded-lg border p-4 sm:p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User
            size={16}
            className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
          />
          <h3
            className="font-semibold text-sm sm:text-base"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Personal Information
          </h3>
        </div>

        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          <div className="space-y-1">
            <p
              className="text-xs uppercase tracking-wider"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Date of Birth
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <p
                className="font-medium text-sm"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {formatDate(patient.date_of_birth)}
              </p>
              {age && (
                <span
                  className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  {age} years old
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p
              className="text-xs uppercase tracking-wider"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Gender
            </p>
            <p
              className="font-medium capitalize text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patient.gender || 'Not specified'}
            </p>
          </div>

          <div className="space-y-1">
            <p
              className="text-xs uppercase tracking-wider"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Civil Status
            </p>
            <p
              className="font-medium capitalize text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patient.civil_status || 'Not specified'}
            </p>
          </div>

          <div className="space-y-1">
            <p
              className="text-xs uppercase tracking-wider"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Nationality
            </p>
            <p
              className="font-medium text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patient.nationality || 'Not specified'}
            </p>
          </div>

          <div className="space-y-1">
            <p
              className="text-xs uppercase tracking-wider"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Registration
            </p>
            <p
              className="font-medium capitalize text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {patient.registration_type?.replace('_', ' ') || 'Not specified'}
            </p>
          </div>

          <div className="space-y-1">
            <p
              className="text-xs uppercase tracking-wider"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              First Visit
            </p>
            <p
              className="font-medium text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {formatDate(patient.first_visit_date)}
            </p>
          </div>
        </div>
      </div>

      {/* Medical Information Card */}
      <div
        className={`rounded-lg border p-4 sm:p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity
            size={16}
            className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
          />
          <h3
            className="font-semibold text-sm sm:text-base"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Medical Information
          </h3>
        </div>

        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Droplet
                size={12}
                className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
              />
              <p
                className="text-xs uppercase tracking-wider"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Blood Type
              </p>
            </div>
            <p
              className={`font-medium text-sm ${patient.blood_type ? '' : 'italic'}`}
              style={{
                color: patient.blood_type
                  ? isDarkMode
                    ? COLORS.text.white
                    : COLORS.text.primary
                  : isDarkMode
                    ? COLORS.text.light
                    : COLORS.text.secondary,
              }}
            >
              {patient.blood_type || 'Not specified'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale
                size={12}
                className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
              />
              <p
                className="text-xs uppercase tracking-wider"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Weight
              </p>
            </div>
            <p
              className={`font-medium text-sm ${patient.weight ? '' : 'italic'}`}
              style={{
                color: patient.weight
                  ? isDarkMode
                    ? COLORS.text.white
                    : COLORS.text.primary
                  : isDarkMode
                    ? COLORS.text.light
                    : COLORS.text.secondary,
              }}
            >
              {patient.weight ? `${patient.weight} kg` : 'Not specified'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ruler
                size={12}
                className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
              />
              <p
                className="text-xs uppercase tracking-wider"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Height
              </p>
            </div>
            <p
              className={`font-medium text-sm ${patient.height ? '' : 'italic'}`}
              style={{
                color: patient.height
                  ? isDarkMode
                    ? COLORS.text.white
                    : COLORS.text.primary
                  : isDarkMode
                    ? COLORS.text.light
                    : COLORS.text.secondary,
              }}
            >
              {patient.height ? `${patient.height} cm` : 'Not specified'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Pill
                size={12}
                className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
              />
              <p
                className="text-xs uppercase tracking-wider"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Current Meds
              </p>
            </div>
            <p
              className={`font-medium text-sm break-words ${patient.current_medications ? '' : 'italic'}`}
              style={{
                color: patient.current_medications
                  ? isDarkMode
                    ? COLORS.text.white
                    : COLORS.text.primary
                  : isDarkMode
                    ? COLORS.text.light
                    : COLORS.text.secondary,
              }}
            >
              {patient.current_medications || 'None recorded'}
            </p>
          </div>
        </div>
      </div>

      {/* Contacts & Insurance - Stack on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Contacts Card */}
        <div
          className={`rounded-lg border p-4 sm:p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Phone
              size={16}
              className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            />
            <h3
              className="font-semibold text-sm sm:text-base"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Contacts
            </h3>
          </div>

          <div className="space-y-3">
            {patient.contacts.length > 0 ? (
              patient.contacts.map((contact, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${contact.is_primary ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-50') : isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-sm break-words"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        {contact.contact_name}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        {contact.relationship}
                      </p>
                    </div>
                    {contact.is_primary && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium whitespace-nowrap">
                        Primary
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm font-mono break-all"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {contact.contact_number}
                  </p>
                  <p
                    className="text-xs mt-1 uppercase tracking-wide"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {contact.contact_type}
                  </p>
                </div>
              ))
            ) : (
              <p
                className="text-sm italic text-center py-4"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                No contacts recorded
              </p>
            )}
          </div>
        </div>

        {/* Insurance Card */}
        <div
          className={`rounded-lg border p-4 sm:p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield
              size={16}
              className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            />
            <h3
              className="font-semibold text-sm sm:text-base"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Insurance Information
            </h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p
                className="text-xs uppercase tracking-wider"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Provider
              </p>
              <p
                className={`font-medium text-sm break-words ${patient.insurance_provider ? '' : 'italic'}`}
                style={{
                  color: patient.insurance_provider
                    ? isDarkMode
                      ? COLORS.text.white
                      : COLORS.text.primary
                    : isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                }}
              >
                {patient.insurance_provider || 'Not specified'}
              </p>
            </div>

            <div className="space-y-1">
              <p
                className="text-xs uppercase tracking-wider"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Policy Number
              </p>
              <p
                className={`font-medium font-mono text-sm break-all ${patient.insurance_number ? '' : 'italic'}`}
                style={{
                  color: patient.insurance_number
                    ? isDarkMode
                      ? COLORS.text.white
                      : COLORS.text.primary
                    : isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                }}
              >
                {patient.insurance_number || 'Not specified'}
              </p>
            </div>

            {patient.insurance_expiry && (
              <div className="space-y-1">
                <p
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  Expiry Date
                </p>
                <p
                  className="font-medium text-sm"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {formatDate(patient.insurance_expiry)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chronic Conditions */}
        {patient.chronic_conditions && (
          <div
            className={`rounded-lg border p-4 sm:p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle
                size={16}
                className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}
              />
              <h3
                className="font-semibold text-sm sm:text-base"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Chronic Conditions
              </h3>
            </div>
            <p
              className="text-sm leading-relaxed break-words"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {patient.chronic_conditions}
            </p>
          </div>
        )}

        {/* Medical History */}
        {patient.medical_history && (
          <div
            className={`rounded-lg border p-4 sm:p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText
                size={16}
                className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              />
              <h3
                className="font-semibold text-sm sm:text-base"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Medical History
              </h3>
            </div>
            <p
              className="text-sm leading-relaxed break-words"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {patient.medical_history}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverViewTab;
