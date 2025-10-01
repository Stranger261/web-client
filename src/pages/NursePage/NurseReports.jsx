// pages/nurse/export default NurseReports;
import { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';

const mockReports = [
  {
    id: 1,
    title: 'Weekly Appointments Report',
    type: 'Appointments',
    date: '2025-09-28',
    status: 'Generated',
  },
  {
    id: 2,
    title: 'Patient Records Summary',
    type: 'Patients',
    date: '2025-09-27',
    status: 'Generated',
  },
  {
    id: 3,
    title: 'Assistance Requests Log',
    type: 'Assistance',
    date: '2025-09-25',
    status: 'Generated',
  },
];

const NurseReports = () => {
  const [reports] = useState(mockReports);
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select className="border rounded px-3 py-2 text-sm">
          <option>All Types</option>
          <option>Appointments</option>
          <option>Patients</option>
          <option>Assistance</option>
        </select>
        <select className="border rounded px-3 py-2 text-sm">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>Custom Range</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{report.title}</td>
                <td className="px-4 py-2">{report.type}</td>
                <td className="px-4 py-2">{report.date}</td>
                <td className="px-4 py-2">{report.status}</td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                  <button
                    className="p-2 rounded hover:bg-gray-200"
                    onClick={() => setSelected(report)}
                  >
                    <Eye size={18} />
                  </button>
                  <button className="p-2 rounded hover:bg-blue-100 text-blue-600">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for details */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-2">{selected.title}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Type: {selected.type} <br />
              Date: {selected.date} <br />
              Status: {selected.status}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseReports;
