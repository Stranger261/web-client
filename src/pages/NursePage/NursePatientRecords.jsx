// src/pages/nurse/NursePatientRecords.jsx
import { useState } from 'react';
import { Eye } from 'lucide-react';

const NursePatientRecords = () => {
  const [patients] = useState([
    {
      id: 'P-001',
      name: 'John Doe',
      gender: 'Male',
      dob: '1990-06-15',
      contact: '0917-123-4567',
      status: 'In-Patient',
    },
    {
      id: 'P-002',
      name: 'Jane Smith',
      gender: 'Female',
      dob: '1985-04-20',
      contact: '0928-555-1234',
      status: 'Out-Patient',
    },
  ]);

  const calculateAge = dob => {
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    return new Date(ageDiff).getUTCFullYear() - 1970;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patient Records</h1>
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
              <th className="px-4 py-2 text-left">MRN / ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Gender</th>
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map(patient => (
              <tr key={patient.id}>
                <td className="px-4 py-2">{patient.id}</td>
                <td className="px-4 py-2">{patient.name}</td>
                <td className="px-4 py-2">{patient.gender}</td>
                <td className="px-4 py-2">{calculateAge(patient.dob)}</td>
                <td className="px-4 py-2">{patient.contact}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      patient.status === 'In-Patient'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {patient.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button className="btn btn-sm btn-ghost text-blue-600">
                    <Eye size={16} />
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

export default NursePatientRecords;
