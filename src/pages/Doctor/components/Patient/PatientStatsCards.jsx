import { User, Activity, FileText, Calendar } from 'lucide-react';
import Card, { CardBody } from '../../../../components/ui/card';
import { COLORS } from '../../../../configs/CONST';

const PatientStatsCards = ({ stats, isDarkMode }) => {
  const statCards = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: User,
      color: COLORS.info,
    },
    {
      label: 'Active Patients',
      value: stats.activePatients,
      icon: Activity,
      color: COLORS.success,
    },
    {
      label: 'With Insurance',
      value: stats.patientsWithInsurance,
      icon: FileText,
      color: COLORS.warning,
    },
    {
      label: 'Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: COLORS.info,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} hover>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className="text-xs md:text-sm mb-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl md:text-3xl font-semibold"
                    style={{
                      color:
                        stat.color === COLORS.success ||
                        stat.color === COLORS.info
                          ? stat.color
                          : isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
                <Icon
                  size={28}
                  style={{ color: stat.color }}
                  className="md:w-8 md:h-8"
                />
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

export default PatientStatsCards;
