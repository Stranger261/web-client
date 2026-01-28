import { Stethoscope, Pill, CalendarCheck } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';

const AppointmentInfoTab = ({
  isDarkMode,
  originatingAppointment,
  getDoctorName,
}) => {
  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto">
      {/* Appointment Details */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <h3
          className="font-semibold mb-3 flex items-center gap-2"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <CalendarCheck className="w-5 h-5" style={{ color: COLORS.info }} />
          Appointment Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p style={{ color: COLORS.text.secondary }}>Appointment Number</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {originatingAppointment.appointment_number}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Type</p>
            <p
              className="font-medium capitalize"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {originatingAppointment.appointment_type}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Date</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {new Date(
                originatingAppointment.appointment_date,
              ).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Time</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {originatingAppointment.start_time} -{' '}
              {originatingAppointment.end_time}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Duration</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {originatingAppointment.duration_minutes} minutes
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Consultation Fee</p>
            <p
              className="font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              ₱{parseFloat(originatingAppointment.consultation_fee).toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ color: COLORS.text.secondary }}>Payment Status</p>
            <span
              className="inline-block px-2 py-1 rounded text-xs font-medium capitalize"
              style={{
                backgroundColor:
                  originatingAppointment.payment_status === 'paid'
                    ? COLORS.badge.success.bg
                    : COLORS.badge.warning.bg,
                color:
                  originatingAppointment.payment_status === 'paid'
                    ? COLORS.badge.success.text
                    : COLORS.badge.warning.text,
              }}
            >
              {originatingAppointment.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Doctor */}
      {originatingAppointment.doctor && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope
              className="w-5 h-5"
              style={{ color: COLORS.primary }}
            />
            <h4
              className="font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Consulting Doctor
            </h4>
          </div>
          <p
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Dr. {getDoctorName(originatingAppointment.doctor)}
          </p>
          {originatingAppointment.doctor.specialization && (
            <p
              className="text-xs mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              {originatingAppointment.doctor.specialization}
            </p>
          )}
        </div>
      )}

      {/* Prescriptions */}
      {originatingAppointment.prescriptions &&
        originatingAppointment.prescriptions.length > 0 && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <h3
              className="font-semibold mb-3 flex items-center gap-2"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              <Pill className="w-5 h-5" style={{ color: COLORS.success }} />
              Prescriptions
            </h3>
            {originatingAppointment.prescriptions.map(prescription => (
              <div key={prescription.prescription_id} className="space-y-3">
                <div
                  className="flex items-center justify-between pb-2 border-b"
                  style={{
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  <div>
                    <p
                      className="font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {prescription.prescription_number}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {new Date(
                        prescription.prescription_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium capitalize"
                    style={{
                      backgroundColor:
                        prescription.prescription_status === 'active'
                          ? COLORS.badge.success.bg
                          : COLORS.badge.warning.bg,
                      color:
                        prescription.prescription_status === 'active'
                          ? COLORS.badge.success.text
                          : COLORS.badge.warning.text,
                    }}
                  >
                    {prescription.prescription_status}
                  </span>
                </div>

                {prescription.notes && (
                  <p
                    className="text-sm italic"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Note: {prescription.notes}
                  </p>
                )}

                {/* Medication Items */}
                {prescription.items && prescription.items.length > 0 && (
                  <div className="space-y-2">
                    {prescription.items.map(item => (
                      <div
                        key={item.item_id}
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode
                            ? COLORS.surface.darkHover
                            : COLORS.surface.lightHover,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p
                              className="font-medium"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {item.medication_name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: COLORS.text.secondary }}
                            >
                              {item.dosage} • {item.frequency} • {item.duration}
                            </p>
                          </div>
                          {item.dispensed && (
                            <span
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: COLORS.badge.success.bg,
                                color: COLORS.badge.success.text,
                              }}
                            >
                              Dispensed
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span style={{ color: COLORS.text.secondary }}>
                              Route:{' '}
                            </span>
                            <span
                              className="font-medium"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {item.route}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: COLORS.text.secondary }}>
                              Quantity:{' '}
                            </span>
                            <span
                              className="font-medium"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {item.quantity}
                            </span>
                          </div>
                        </div>
                        {item.instructions && (
                          <p
                            className="text-xs mt-2 italic"
                            style={{ color: COLORS.text.secondary }}
                          >
                            <strong>Instructions:</strong> {item.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AppointmentInfoTab;
