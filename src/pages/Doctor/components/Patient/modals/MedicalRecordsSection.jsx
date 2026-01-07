import { ChevronDown, ChevronUp } from 'lucide-react';
import Card, { CardBody } from '../../../../../components/ui/card';
import Badge from '../../../../../components/ui/badge';
import { COLORS } from '../../../../../configs/CONST';
import { getRecordTypeColor } from '../utils/patientHelpers';

const MedicalRecordsSection = ({
  patient,
  expandedRecordId,
  onToggleRecord,
  isDarkMode,
}) => {
  if (!patient.medicalRecords || patient.medicalRecords.length === 0) {
    return (
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Medical Records
        </h3>
        <p
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          No medical records available
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        Medical Records
      </h3>
      <div className="space-y-3">
        {patient.medicalRecords.map(record => {
          const isExpanded = expandedRecordId === record.record_id;

          return (
            <Card key={record.record_id} hover>
              <CardBody padding={false}>
                {/* Record Header - Always Visible */}
                <div
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => onToggleRecord(record.record_id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Badge
                        variant={getRecordTypeColor(record.record_type)}
                        className="capitalize"
                      >
                        {record.record_type?.replace('_', ' ')}
                      </Badge>
                      <span
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        {new Date(record.record_date).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {record.diagnosis ||
                        record.chief_complaint ||
                        'Medical Record'}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp
                      size={20}
                      className="flex-shrink-0 ml-2"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    />
                  ) : (
                    <ChevronDown
                      size={20}
                      className="flex-shrink-0 ml-2"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    />
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 border-t"
                    style={{
                      borderColor: isDarkMode
                        ? COLORS.border.dark
                        : COLORS.border.light,
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Visit Information */}
                      <div>
                        <p
                          className="text-xs font-semibold uppercase mb-2"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Visit Information
                        </p>
                        <div className="space-y-2">
                          {record.visit_type && (
                            <div>
                              <p
                                className="text-xs"
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.light
                                    : COLORS.text.secondary,
                                }}
                              >
                                Visit Type
                              </p>
                              <p
                                className="text-sm capitalize"
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.white
                                    : COLORS.text.primary,
                                }}
                              >
                                {record.visit_type.replace('_', ' ')}
                              </p>
                            </div>
                          )}
                          {record.visit_id && (
                            <div>
                              <p
                                className="text-xs"
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.light
                                    : COLORS.text.secondary,
                                }}
                              >
                                Visit ID
                              </p>
                              <p
                                className="text-sm"
                                style={{
                                  color: isDarkMode
                                    ? COLORS.text.white
                                    : COLORS.text.primary,
                                }}
                              >
                                {record.visit_id}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Chief Complaint */}
                      {record.chief_complaint && (
                        <div className="md:col-span-2">
                          <p
                            className="text-xs font-semibold uppercase mb-2"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Chief Complaint
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {record.chief_complaint}
                          </p>
                        </div>
                      )}

                      {/* Diagnosis */}
                      {record.diagnosis && (
                        <div className="md:col-span-2">
                          <p
                            className="text-xs font-semibold uppercase mb-2"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Diagnosis
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {record.diagnosis}
                          </p>
                        </div>
                      )}

                      {/* Treatment */}
                      {record.treatment && (
                        <div className="md:col-span-2">
                          <p
                            className="text-xs font-semibold uppercase mb-2"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Treatment
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {record.treatment}
                          </p>
                        </div>
                      )}

                      {/* Prescription */}
                      {record.prescription && (
                        <div className="md:col-span-2">
                          <p
                            className="text-xs font-semibold uppercase mb-2"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Prescription
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {record.prescription}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div className="md:col-span-2">
                          <p
                            className="text-xs font-semibold uppercase mb-2"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                            }}
                          >
                            Notes
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {record.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MedicalRecordsSection;
