// src/pages/nurse/Appointments.jsx
import { useState } from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { formatTime } from '../../utils/FormatTime';

const NurseAppointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: 'John Doe',
      doctor: 'Dr. Smith',
      date: '2025-09-30T10:30:00',
      status: 'Upcoming',
    },
    {
      id: 2,
      patient: 'Jane Lee',
      doctor: 'Dr. Adams',
      date: '2025-09-30T11:15:00',
      status: 'Checked-in',
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointments</h1>
        {/* Filter/Search (extend later) */}
        <input
          type="text"
          placeholder="Search patient..."
          className="input input-bordered w-64"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Doctor</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appointments.map(appt => (
              <tr key={appt.id}>
                <td className="px-4 py-2">{appt.patient}</td>
                <td className="px-4 py-2">{appt.doctor}</td>
                <td className="px-4 py-2">{formatDate(appt.date)}</td>
                <td className="px-4 py-2">{formatTime(appt.date)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      appt.status === 'Upcoming'
                        ? 'bg-blue-100 text-blue-600'
                        : appt.status === 'Checked-in'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <button className="btn btn-sm btn-ghost text-blue-600">
                    <Eye size={16} />
                  </button>
                  <button className="btn btn-sm btn-ghost text-green-600">
                    <CheckCircle size={16} />
                  </button>
                  <button className="btn btn-sm btn-ghost text-red-600">
                    <XCircle size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NurseAppointments;
