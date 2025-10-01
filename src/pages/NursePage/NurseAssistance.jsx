// pages/nurse/NurseAssistance.jsx
import { useState } from 'react';
import { Eye, CheckCircle, Clock } from 'lucide-react';

const mockRequests = [
  {
    id: 1,
    from: 'Dr. Santos',
    type: 'Patient Emergency',
    priority: 'High',
    status: 'Pending',
    time: '10:45 AM',
    details: 'Assistance needed in Room 204 – patient fainted.',
  },
  {
    id: 2,
    from: 'Ward 3',
    type: 'Equipment',
    priority: 'Medium',
    status: 'In-progress',
    time: '09:15 AM',
    details: 'IV stand required for new patient admission.',
  },
  {
    id: 3,
    from: 'Reception',
    type: 'Patient Transport',
    priority: 'Low',
    status: 'Completed',
    time: '08:30 AM',
    details: 'Wheelchair transport requested for outpatient.',
  },
];

const NurseAssistance = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [selected, setSelected] = useState(null);

  const updateStatus = (id, newStatus) => {
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Assistance Requests</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['All', 'Pending', 'In-progress', 'Completed'].map(filter => (
          <button
            key={filter}
            className="px-4 py-2 text-sm rounded border hover:bg-gray-100"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">From</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2">{req.from}</td>
                <td className="px-4 py-2">{req.type}</td>
                <td
                  className={`px-4 py-2 font-medium ${
                    req.priority === 'High'
                      ? 'text-red-600'
                      : req.priority === 'Medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {req.priority}
                </td>
                <td className="px-4 py-2">{req.status}</td>
                <td className="px-4 py-2">{req.time}</td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                  <button
                    className="p-2 rounded hover:bg-gray-200"
                    onClick={() => setSelected(req)}
                  >
                    <Eye size={18} />
                  </button>
                  {req.status !== 'Completed' && (
                    <button
                      className="p-2 rounded hover:bg-green-100 text-green-600"
                      onClick={() => updateStatus(req.id, 'Completed')}
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {req.status === 'Pending' && (
                    <button
                      className="p-2 rounded hover:bg-yellow-100 text-yellow-600"
                      onClick={() => updateStatus(req.id, 'In-progress')}
                    >
                      <Clock size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-2">Request Details</h2>
            <p className="text-sm text-gray-600 mb-4">{selected.details}</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              {selected.status !== 'Completed' && (
                <button
                  className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    updateStatus(selected.id, 'Completed');
                    setSelected(null);
                  }}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseAssistance;
