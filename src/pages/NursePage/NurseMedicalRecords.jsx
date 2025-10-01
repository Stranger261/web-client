// src/pages/nurse/NurseMedicalRecords.jsx
import { useState } from 'react';
import { Eye, FileDown } from 'lucide-react';

const NurseMedicalRecords = () => {
  const [records] = useState([
    {
      id: 1,
      patient: 'John Doe',
      type: 'Clinic Visit',
      reason: 'Fever and cough',
      diagnosis: 'Viral Infection',
      doctor: 'Dr. Smith',
      date: '2025-09-28T10:00:00',
      addedBy: 'Nurse Anna',
      attachment: null,
    },
    {
      id: 2,
      patient: 'Jane Smith',
      type: 'Lab Result',
      reason: 'Blood Test',
      diagnosis: 'Normal',
      doctor: 'Dr. Adams',
      date: '2025-09-27T15:30:00',
      addedBy: 'Nurse Mia',
      attachment: '/files/lab-result-janesmith.pdf',
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Medical Records</h1>
        <input
          type="text"
          placeholder="Search patient by name or MRN..."
          className="input input-bordered w-72"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Reason / Diagnosis</th>
              <th className="px-4 py-2 text-left">Doctor</th>
              <th className="px-4 py-2 text-left">Added By</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map(record => (
              <tr key={record.id}>
                <td className="px-4 py-2">
                  {new Date(record.date).toLocaleString()}
                </td>
                <td className="px-4 py-2">{record.patient}</td>
                <td className="px-4 py-2">{record.type}</td>
                <td className="px-4 py-2">
                  {record.reason} <br />
                  <span className="text-sm text-gray-600">
                    {record.diagnosis}
                  </span>
                </td>
                <td className="px-4 py-2">{record.doctor}</td>
                <td className="px-4 py-2">{record.addedBy}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button className="btn btn-sm btn-ghost text-blue-600">
                    <Eye size={16} />
                  </button>
                  {record.attachment && (
                    <a
                      href={record.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost text-green-600"
                    >
                      <FileDown size={16} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NurseMedicalRecords;
