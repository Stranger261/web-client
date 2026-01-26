import {
  User,
  Activity,
  FileText,
  Calendar,
  UserPlus,
  Shield,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Card, { CardBody } from '../../ui/card';
import { COLORS } from '../../../configs/CONST';

const PatientStatsCards = ({ stats, isDarkMode, userRole }) => {
  // Don't show stats cards for doctors
  if (userRole === 'doctor') {
    return null;
  }

  // Define stats based on role
  const getStatCards = () => {
    // Receptionist/Admin stats
    if (userRole === 'receptionist' || userRole === 'admin') {
      return [
        {
          label: 'Total Patients',
          value: stats?.totalPatients || stats?.total || 0,
          icon: User,
          color: COLORS.info,
        },
        {
          label: 'Active Patients',
          value: stats?.activePatients || stats?.active || 0,
          icon: Activity,
          color: COLORS.success,
        },
        {
          label: 'With Insurance',
          value: stats?.patientsWithInsurance || 0,
          icon: Shield,
          color: COLORS.warning,
        },
        {
          label: 'Upcoming Appointments',
          value: stats?.upcomingAppointments || 0,
          icon: Calendar,
          color: COLORS.info,
        },
        {
          label: 'New This Week',
          value: stats?.newPatientsThisWeek || 0,
          icon: UserPlus,
          color: COLORS.success,
        },
        {
          label: 'New This Month',
          value: stats?.newPatientsThisMonth || 0,
          icon: TrendingUp,
          color: COLORS.primary,
        },
        {
          label: 'Without Insurance',
          value: stats?.patientsWithoutInsurance || 0,
          icon: FileText,
          color: COLORS.danger,
        },
        {
          label: 'Total Appointments',
          value: stats?.totalAppointments || 0,
          icon: Clock,
          color: COLORS.secondary,
        },
      ];
    }

    // Nurse stats (simplified view)
    if (userRole === 'nurse') {
      return [
        {
          label: 'Total Patients',
          value: stats?.total || 0,
          icon: User,
          color: COLORS.info,
        },
        {
          label: 'Active Patients',
          value: stats?.active || 0,
          icon: Activity,
          color: COLORS.success,
        },
        {
          label: 'Inactive Patients',
          value: stats?.inactive || 0,
          icon: User,
          color: COLORS.secondary,
        },
        {
          label: 'Without Face ID',
          value: stats?.withoutFace || 0,
          icon: FileText,
          color: COLORS.warning,
        },
      ];
    }

    return [];
  };

  const statCards = getStatCards();

  if (statCards.length === 0) {
    return null;
  }

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
