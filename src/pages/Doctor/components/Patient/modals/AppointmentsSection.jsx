import Badge from '../../../../../components/ui/badge';
import { COLORS } from '../../../../../configs/CONST';

const AppointmentsSection = ({ patient, isDarkMode }) => {
  if (!patient.appointments || patient.appointments.length === 0) {
    return (
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          Upcoming Appointments
        </h3>
        <p
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          No upcoming appointments
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
        Upcoming Appointments
      </h3>
      <div className="space-y-3">
        {patient.appointments.map(apt => (
          <div
            key={apt.appointment_id}
            className="p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.background.dark
                : COLORS.background.light,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <div>
              <p
                className="font-medium capitalize"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {apt.appointment_type?.replace('_', ' ') || 'Appointment'}
              </p>
              <p
                className="text-sm mt-1"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge variant="info" className="capitalize">
              {apt.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsSection;
