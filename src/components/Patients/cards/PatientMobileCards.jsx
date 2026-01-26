import { Eye, Trash2, Phone, Mail } from 'lucide-react';

import Card, { CardBody } from '../../ui/card';
import Badge from '../../ui/badge';
import { Button } from '../../ui/button';
import { LoadingSpinner } from '../../ui/loading-spinner';
import Pagination from '../../ui/pagination';

import { COLORS } from '../../../configs/CONST';

import { calculateAge, getStatusVariant } from '../utils/patientHelpers';

const PatientMobileCards = ({
  patients,
  pagination,
  isLoading,
  onViewPatient,
  onDeletePatient,
  onPageChange,
  onLimitChange,
  isDarkMode,
}) => {
  if (isLoading) {
    return (
      <div
        className="rounded-xl shadow-sm border p-16 flex flex-col items-center justify-center"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          minHeight: '300px',
        }}
      >
        <LoadingSpinner size="lg" />
        <p
          className="mt-4 text-sm"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          Loading patients...
        </p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div
        className="rounded-xl shadow-sm border p-8 text-center"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <p
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          No patients found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 mb-4">
        {patients.map(patient => (
          <Card key={patient.patient_id} hover>
            <CardBody>
              {/* Header with Avatar */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.info} 0%, ${COLORS.primary} 100%)`,
                  }}
                >
                  {patient.first_name}
                  {patient.last_name}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-base truncate"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <p
                    className="text-xs mt-1"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {patient.mrn} • {patient.patient_uuid}
                  </p>
                </div>
                <Badge
                  variant={getStatusVariant(patient.patient_status)}
                  className="capitalize flex-shrink-0"
                >
                  {patient.patient_status}
                </Badge>
              </div>

              {/* Patient Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p
                    className="text-xs"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Age
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {calculateAge(patient.date_of_birth)} years
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Gender
                  </p>
                  <p
                    className="text-sm font-medium capitalize"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {patient.gender}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Phone
                    size={14}
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  />
                  <span
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {patient?.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail
                    size={14}
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  />
                  <span
                    className="text-sm truncate"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {patient?.email || 'N/A'}
                  </span>
                </div>
              </div>

              {/* First Visit */}
              {patient.first_visit_date && (
                <div className="mb-4">
                  <p
                    className="text-xs"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    First Visit
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {new Date(patient.first_visit_date).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    )}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div
                className="flex gap-2 pt-3 border-t"
                style={{
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  icon={Eye}
                  onClick={() => onViewPatient(patient)}
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  iconOnly
                  onClick={() => onDeletePatient(patient)}
                />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {patients.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
          onItemsPerPageChange={onLimitChange}
        />
      )}
    </>
  );
};

export default PatientMobileCards;
