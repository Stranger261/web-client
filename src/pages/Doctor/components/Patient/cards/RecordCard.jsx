import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  User,
  Stethoscope,
  FileText,
  Activity,
  Heart,
  Weight,
  Pill,
  ChevronDown,
} from 'lucide-react';

import { COLORS } from '../../../../../configs/CONST';
import { formatDate } from '../../../../../utils/dateFormatter';

export const RecordCard = ({ record, isDarkMode }) => {
  const [expandedRecord, setExpandedRecord] = useState(null);

  const isExpanded = expandedRecord === record.record_id;

  return (
    <motion.div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpandedRecord(isExpanded ? null : record.record_id)}
        style={{
          backgroundColor: isExpanded
            ? isDarkMode
              ? COLORS.surface.darkHover
              : '#f9fafb'
            : 'transparent',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{
                  backgroundColor:
                    record.type === 'Consultation' ? '#dbeafe' : '#fef3c7',
                  color: record.type === 'Consultation' ? '#1e40af' : '#92400e',
                }}
              >
                {record.type || 'Consultation'}
              </span>
              <span
                className="text-xs"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                {formatDate(record.date)}
              </span>
            </div>
            <h4
              className="font-bold text-base mb-1"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {record.diagnosis || 'No diagnosis'}
            </h4>
            <p
              className="text-sm"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {record.chiefComplaint || 'No chief complaint recorded'}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ChevronDown
              size={20}
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="p-4 pb-4 space-y-3 border-t"
              style={{
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
              }}
            >
              {/* Vital Signs */}
              {record.vitalSigns && (
                <div className="pt-3">
                  <h5
                    className="text-xs font-bold uppercase mb-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    Vital Signs
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {record.vitalSigns.bp && (
                      <div className="flex items-center gap-2">
                        <Activity size={16} style={{ color: COLORS.danger }} />
                        <span
                          className="text-sm"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          BP: {record.vitalSigns.bp}
                        </span>
                      </div>
                    )}
                    {record.vitalSigns.pulse && (
                      <div className="flex items-center gap-2">
                        <Heart size={16} style={{ color: COLORS.danger }} />
                        <span
                          className="text-sm"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Pulse: {record.vitalSigns.pulse}
                        </span>
                      </div>
                    )}
                    {record.vitalSigns.temp && (
                      <div className="flex items-center gap-2">
                        <Activity size={16} style={{ color: COLORS.warning }} />
                        <span
                          className="text-sm"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Temp: {record.vitalSigns.temp}
                        </span>
                      </div>
                    )}
                    {record.vitalSigns.weight && (
                      <div className="flex items-center gap-2">
                        <Weight size={16} style={{ color: COLORS.info }} />
                        <span
                          className="text-sm"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Weight: {record.vitalSigns.weight}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Treatment */}
              {record.treatment && (
                <div>
                  <h5
                    className="text-xs font-bold uppercase mb-1 flex items-center gap-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    <Stethoscope size={14} />
                    Treatment
                  </h5>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {record.treatment}
                  </p>
                </div>
              )}

              {/* Prescription */}
              {record.prescription && (
                <div>
                  <h5
                    className="text-xs font-bold uppercase mb-1 flex items-center gap-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    <Pill size={14} />
                    Prescription
                  </h5>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {record.prescription}
                  </p>
                </div>
              )}

              {/* Notes */}
              {record.notes && (
                <div>
                  <h5
                    className="text-xs font-bold uppercase mb-1 flex items-center gap-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    <FileText size={14} />
                    Notes
                  </h5>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {record.notes}
                  </p>
                </div>
              )}

              {/* Doctor */}
              {record.doctor && (
                <div
                  className="flex items-center gap-2 pt-2 border-t"
                  style={{
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  <User
                    size={14}
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    Attended by:{' '}
                    <strong>
                      {record.doctor.person.first_name}{' '}
                      {record.doctor.person.last_name}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
