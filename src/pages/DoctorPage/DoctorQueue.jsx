import React, { useState } from 'react';
import {
  Clock,
  User,
  Phone,
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  Edit2,
  AlertCircle,
} from 'lucide-react';

export default function DoctorQueue() {
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'John Smith',
      age: 45,
      phone: '+63 917 123 4567',
      time: '09:00 AM',
      status: 'waiting',
      priority: 'normal',
      reason: 'Regular Checkup',
    },
    {
      id: 2,
      name: 'Maria Santos',
      age: 32,
      phone: '+63 918 234 5678',
      time: '09:15 AM',
      status: 'waiting',
      priority: 'urgent',
      reason: 'Chest Pain',
    },
    {
      id: 3,
      name: 'Robert Chen',
      age: 58,
      phone: '+63 919 345 6789',
      time: '09:30 AM',
      status: 'in-progress',
      priority: 'normal',
      reason: 'Follow-up Consultation',
    },
    {
      id: 4,
      name: 'Anna Garcia',
      age: 28,
      phone: '+63 920 456 7890',
      time: '09:45 AM',
      status: 'waiting',
      priority: 'normal',
      reason: 'Annual Physical Exam',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    time: '',
    priority: 'normal',
    reason: '',
  });

  const addPatient = () => {
    if (
      formData.name &&
      formData.age &&
      formData.phone &&
      formData.time &&
      formData.reason
    ) {
      const newPatient = {
        id: patients.length + 1,
        ...formData,
        status: 'waiting',
      };
      setPatients([...patients, newPatient]);
      setFormData({
        name: '',
        age: '',
        phone: '',
        time: '',
        priority: 'normal',
        reason: '',
      });
      setShowAddModal(false);
    }
  };

  const updateStatus = (id, newStatus) => {
    setPatients(
      patients.map(p => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const removePatient = id => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const getStatusColor = status => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = priority => {
    return priority === 'urgent'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  const inProgressCount = patients.filter(
    p => p.status === 'in-progress'
  ).length;
  const completedCount = patients.filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Patient Queue Management
              </h1>
              <p className="text-gray-600">
                Monitor and manage patient appointments efficiently
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus size={20} />
              Add Patient
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Waiting</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {waitingCount}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {inProgressCount}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {completedCount}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Queue */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
            <h2 className="text-2xl font-bold text-white">Patient Queue</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Queue #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold text-indigo-600">
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <User className="text-indigo-600" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {patient.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {patient.age} years old
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} />
                        <span className="font-medium">{patient.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                          patient.priority
                        )}`}
                      >
                        {patient.priority === 'urgent' && (
                          <AlertCircle size={12} className="inline mr-1" />
                        )}
                        {patient.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          patient.status
                        )}`}
                      >
                        {patient.status.toUpperCase().replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowDetailsModal(true);
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Edit2 size={16} />
                        </button>
                        {patient.status === 'waiting' && (
                          <button
                            onClick={() =>
                              updateStatus(patient.id, 'in-progress')
                            }
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Start
                          </button>
                        )}
                        {patient.status === 'in-progress' && (
                          <button
                            onClick={() =>
                              updateStatus(patient.id, 'completed')
                            }
                            className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {patient.status === 'completed' && (
                          <button
                            onClick={() => removePatient(patient.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Patient
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+63 XXX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  value={formData.reason}
                  onChange={e =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief description"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPatient}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Patient Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-indigo-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedPatient.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Age</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedPatient.age} years
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedPatient.time}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={16} className="text-gray-600" />
                  <p className="text-sm text-gray-600">Phone Number</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedPatient.phone}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Priority</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                    selectedPatient.priority
                  )}`}
                >
                  {selectedPatient.priority.toUpperCase()}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    selectedPatient.status
                  )}`}
                >
                  {selectedPatient.status.toUpperCase().replace('-', ' ')}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Reason for Visit</p>
                <p className="text-gray-800">{selectedPatient.reason}</p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
