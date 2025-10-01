// src/pages/nurse/Dashboard.jsx
import {
  Calendar,
  Users,
  Bell,
  ClipboardList,
  Activity,
  AlertTriangle,
} from 'lucide-react';

import StatsCard from '../../components/Card/StatsCard';

const NurseDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Nurse Dashboard</h1>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Today's Appointments" value="12" icon={Calendar} />
        <StatsCard
          title="Active Patients"
          value="8"
          icon={Users}
          bgColor="bg-green-500"
        />
        <StatsCard
          title="Pending Tasks"
          value="5"
          icon={ClipboardList}
          bgColor="bg-yellow-500"
        />
        <StatsCard
          title="New Alerts"
          value="3"
          icon={Bell}
          bgColor="bg-red-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card title="Upcoming Appointments">
            <ul className="divide-y">
              <li className="py-2 flex justify-between">
                <span>John Doe (10:30 AM)</span>
                <span className="text-sm text-gray-500">Dr. Smith</span>
              </li>
              <li className="py-2 flex justify-between">
                <span>Jane Lee (11:15 AM)</span>
                <span className="text-sm text-gray-500">Dr. Adams</span>
              </li>
            </ul>
          </Card>

          <Card title="Assigned Patients">
            <ul className="divide-y">
              <li className="py-2 flex justify-between">
                <span>Michael Reyes (Room 203)</span>
                <span className="text-sm text-red-500">Critical</span>
              </li>
              <li className="py-2 flex justify-between">
                <span>Sophia Cruz (Room 105)</span>
                <span className="text-sm text-green-500">Stable</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card title="Pending Tasks">
            <ul className="divide-y">
              <li className="py-2 flex justify-between">
                <span>Check vitals for Room 203</span>
                <span className="text-sm text-gray-500">Due 10:00 AM</span>
              </li>
              <li className="py-2 flex justify-between">
                <span>Administer medication to Room 105</span>
                <span className="text-sm text-gray-500">Due 11:00 AM</span>
              </li>
            </ul>
          </Card>

          <Card title="Alerts & Notifications">
            <ul className="divide-y">
              <li className="py-2 flex items-center space-x-2 text-red-600">
                <AlertTriangle size={16} />
                <span>Emergency call from Room 201</span>
              </li>
              <li className="py-2 flex items-center space-x-2 text-yellow-600">
                <Activity size={16} />
                <span>Lab result ready for Patient #1234</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 🔹 Reusable Card Component
const Card = ({ title, children }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);

export default NurseDashboard;
