import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  Settings,
  ChevronRight,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Bell,
  Edit2,
  Trash2,
  Heart,
  Droplet,
  Thermometer,
  Weight,
} from 'lucide-react';

const DoctorPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      phone: '+63 917 123 4567',
      email: 'john.smith@email.com',
      address: '123 Main St, Quezon City',
      bloodType: 'O+',
      condition: 'Hypertension',
      lastVisit: '2025-09-20',
      nextAppointment: '2025-10-20',
      status: 'active',
      allergies: 'Penicillin',
      currentMedication: 'Losartan 50mg daily',
      vitals: {
        bp: '130/85',
        heartRate: '72',
        temp: '36.8',
        weight: '78',
      },
      medicalHistory: [
        {
          date: '2025-09-20',
          diagnosis: 'Hypertension follow-up',
          prescription: 'Continue Losartan 50mg',
          notes: 'Blood pressure improving, patient compliant with medication',
        },
        {
          date: '2025-08-15',
          diagnosis: 'Hypertension check-up',
          prescription: 'Losartan 50mg daily',
          notes: 'Started on medication, advised lifestyle changes',
        },
      ],
    },
    {
      id: 2,
      name: 'Maria Santos',
      age: 32,
      gender: 'Female',
      phone: '+63 918 234 5678',
      email: 'maria.santos@email.com',
      address: '456 Oak Ave, Makati City',
      bloodType: 'A+',
      condition: 'Asthma',
      lastVisit: '2025-09-28',
      nextAppointment: '2025-11-28',
      status: 'active',
      allergies: 'Dust, Pollen',
      currentMedication: 'Salbutamol inhaler PRN',
      vitals: {
        bp: '120/80',
        heartRate: '68',
        temp: '36.5',
        weight: '58',
      },
      medicalHistory: [
        {
          date: '2025-09-28',
          diagnosis: 'Asthma control visit',
          prescription: 'Continue Salbutamol PRN',
          notes: 'Good asthma control, no recent attacks',
        },
      ],
    },
    {
      id: 3,
      name: 'Robert Chen',
      age: 58,
      gender: 'Male',
      phone: '+63 919 345 6789',
      email: 'robert.chen@email.com',
      address: '789 Pine Rd, Pasig City',
      bloodType: 'B+',
      condition: 'Type 2 Diabetes',
      lastVisit: '2025-09-15',
      nextAppointment: '2025-10-15',
      status: 'active',
      allergies: 'None',
      currentMedication: 'Metformin 500mg twice daily',
      vitals: {
        bp: '135/88',
        heartRate: '75',
        temp: '36.7',
        weight: '85',
      },
      medicalHistory: [
        {
          date: '2025-09-15',
          diagnosis: 'Diabetes management',
          prescription: 'Metformin 500mg BID',
          notes: 'HbA1c at 7.2%, continue current management',
        },
      ],
    },
    {
      id: 4,
      name: 'Anna Garcia',
      age: 28,
      gender: 'Female',
      phone: '+63 920 456 7890',
      email: 'anna.garcia@email.com',
      address: '321 Elm St, Taguig City',
      bloodType: 'AB+',
      condition: 'Healthy',
      lastVisit: '2024-10-05',
      nextAppointment: '2025-10-05',
      status: 'active',
      allergies: 'None',
      currentMedication: 'None',
      vitals: {
        bp: '115/75',
        heartRate: '65',
        temp: '36.6',
        weight: '55',
      },
      medicalHistory: [
        {
          date: '2024-10-05',
          diagnosis: 'Annual physical exam',
          prescription: 'None',
          notes: 'All results normal, excellent health',
        },
      ],
    },
    {
      id: 5,
      name: 'Sofia Rodriguez',
      age: 39,
      gender: 'Female',
      phone: '+63 922 678 9012',
      email: 'sofia.rod@email.com',
      address: '555 Maple Dr, Manila',
      bloodType: 'O-',
      condition: 'Chronic Migraine',
      lastVisit: '2025-08-12',
      nextAppointment: '2025-11-12',
      status: 'active',
      allergies: 'Sulfa drugs',
      currentMedication: 'Sumatriptan 50mg PRN',
      vitals: {
        bp: '125/82',
        heartRate: '70',
        temp: '36.7',
        weight: '62',
      },
      medicalHistory: [
        {
          date: '2025-08-12',
          diagnosis: 'Migraine management',
          prescription: 'Sumatriptan 50mg PRN',
          notes: 'Frequency reduced to 2x per month',
        },
      ],
    },
    {
      id: 6,
      name: 'Michael Torres',
      age: 44,
      gender: 'Male',
      phone: '+63 923 789 0123',
      email: 'michael.t@email.com',
      address: '777 Cedar Ln, Mandaluyong',
      bloodType: 'A-',
      condition: 'Hypertension',
      lastVisit: '2025-09-25',
      nextAppointment: '2025-10-25',
      status: 'active',
      allergies: 'None',
      currentMedication: 'Amlodipine 5mg daily',
      vitals: {
        bp: '128/84',
        heartRate: '73',
        temp: '36.8',
        weight: '82',
      },
      medicalHistory: [
        {
          date: '2025-09-25',
          diagnosis: 'Blood pressure monitoring',
          prescription: 'Continue Amlodipine 5mg',
          notes: 'Good control achieved',
        },
      ],
    },
  ]);

  const [newRecord, setNewRecord] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
  });

  const [newVitals, setNewVitals] = useState({
    bp: '',
    heartRate: '',
    temp: '',
    weight: '',
  });

  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterCondition === 'all' ||
      p.condition.toLowerCase().includes(filterCondition.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    chronic: patients.filter(p =>
      ['Hypertension', 'Diabetes', 'Asthma', 'Chronic Migraine'].some(c =>
        p.condition.includes(c)
      )
    ).length,
    followUp: patients.filter(
      p =>
        new Date(p.nextAppointment) <=
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  const saveNewRecord = () => {
    if (selectedPatient && newRecord.diagnosis) {
      const updatedPatients = patients.map(p => {
        if (p.id === selectedPatient.id) {
          return {
            ...p,
            medicalHistory: [
              {
                date: new Date().toISOString().split('T')[0],
                diagnosis: newRecord.diagnosis,
                prescription: newRecord.prescription,
                notes: newRecord.notes,
              },
              ...p.medicalHistory,
            ],
            lastVisit: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      });
      setPatients(updatedPatients);
      setNewRecord({ diagnosis: '', prescription: '', notes: '' });
      setShowRecordModal(false);
    }
  };

  const updateVitals = () => {
    if (selectedPatient) {
      const updatedPatients = patients.map(p => {
        if (p.id === selectedPatient.id) {
          return {
            ...p,
            vitals: newVitals,
          };
        }
        return p;
      });
      setPatients(updatedPatients);
      setNewVitals({ bp: '', heartRate: '', temp: '', weight: '' });
      setShowVitalsModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Dr. Sarah Anderson
                </h1>
                <p className="text-sm text-gray-600">
                  Internal Medicine Specialist
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              My Patients
            </h2>
            <p className="text-gray-600">
              Manage and monitor your patients' health records
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.active}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Chronic Cases
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.chronic}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Heart className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Follow-up This Week
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.followUp}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or condition..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <select
                value={filterCondition}
                onChange={e => setFilterCondition(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Conditions</option>
                <option value="hypertension">Hypertension</option>
                <option value="diabetes">Diabetes</option>
                <option value="asthma">Asthma</option>
                <option value="migraine">Migraine</option>
                <option value="healthy">Healthy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {patient.age} years • {patient.gender}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                  {patient.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="text-orange-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Condition</p>
                    <p className="text-sm font-medium text-gray-800">
                      {patient.condition}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Droplet
                    size={16}
                    className="text-red-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Blood Type</p>
                    <p className="text-sm font-medium text-gray-800">
                      {patient.bloodType}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600">Last Visit</p>
                    <p className="text-sm font-medium text-gray-800">
                      {patient.lastVisit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Next Apt.</p>
                    <p className="text-sm font-medium text-gray-800">
                      {patient.nextAppointment}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPatient(patient);
                  setShowPatientModal(true);
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                View Full Record
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Full Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full">
                    <User className="text-blue-600" size={32} />
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">
                      {selectedPatient.name}
                    </h3>
                    <p className="text-blue-100">
                      {selectedPatient.age} years • {selectedPatient.gender} •{' '}
                      {selectedPatient.bloodType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowPatientModal(false);
                    setShowRecordModal(true);
                  }}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Medical Record
                </button>
                <button
                  onClick={() => {
                    setNewVitals(selectedPatient.vitals);
                    setShowPatientModal(false);
                    setShowVitalsModal(true);
                  }}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Activity size={18} />
                  Update Vitals
                </button>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Phone size={18} className="text-blue-600" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.email}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Vitals */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" />
                  Current Vitals
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <Heart className="text-red-500 mx-auto mb-2" size={24} />
                    <p className="text-xs text-gray-600">Blood Pressure</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedPatient.vitals.bp}
                    </p>
                    <p className="text-xs text-gray-500">mmHg</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <Activity
                      className="text-pink-500 mx-auto mb-2"
                      size={24}
                    />
                    <p className="text-xs text-gray-600">Heart Rate</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedPatient.vitals.heartRate}
                    </p>
                    <p className="text-xs text-gray-500">bpm</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <Thermometer
                      className="text-orange-500 mx-auto mb-2"
                      size={24}
                    />
                    <p className="text-xs text-gray-600">Temperature</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedPatient.vitals.temp}
                    </p>
                    <p className="text-xs text-gray-500">°C</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <Weight className="text-blue-500 mx-auto mb-2" size={24} />
                    <p className="text-xs text-gray-600">Weight</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedPatient.vitals.weight}
                    </p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle size={18} className="text-yellow-600" />
                  Medical Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Condition</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.condition}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Allergies</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.allergies}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Current Medication</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.currentMedication}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    Medical History
                  </h4>
                </div>
                <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
                  {selectedPatient.medicalHistory.map((record, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {record.diagnosis}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Calendar size={14} />
                            {record.date}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">
                            Prescription
                          </p>
                          <p className="text-sm text-gray-800">
                            {record.prescription}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">
                            Notes
                          </p>
                          <p className="text-sm text-gray-800">
                            {record.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Medical Record Modal */}
      {showRecordModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Add Medical Record
                </h3>
                <p className="text-gray-600 mt-1">
                  Patient: {selectedPatient.name}
                </p>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <textarea
                  value={newRecord.diagnosis}
                  onChange={e =>
                    setNewRecord({ ...newRecord, diagnosis: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter diagnosis details..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prescription
                </label>
                <textarea
                  value={newRecord.prescription}
                  onChange={e =>
                    setNewRecord({ ...newRecord, prescription: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Medications, dosage, and instructions..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medical Notes
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={e =>
                    setNewRecord({ ...newRecord, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional observations and recommendations..."
                  rows="4"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRecordModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNewRecord}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Vitals Modal */}
      {showVitalsModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Update Vital Signs
                </h3>
                <p className="text-gray-600 mt-1">
                  Patient: {selectedPatient.name}
                </p>
              </div>
              <button
                onClick={() => setShowVitalsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Blood Pressure
                  </label>
                  <div className="relative">
                    <Heart
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={newVitals.bp}
                      onChange={e =>
                        setNewVitals({ ...newVitals, bp: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="120/80"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">mmHg</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Heart Rate
                  </label>
                  <div className="relative">
                    <Activity
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={newVitals.heartRate}
                      onChange={e =>
                        setNewVitals({
                          ...newVitals,
                          heartRate: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="72"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">bpm</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temperature
                  </label>
                  <div className="relative">
                    <Thermometer
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={newVitals.temp}
                      onChange={e =>
                        setNewVitals({ ...newVitals, temp: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="36.5"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">°C</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Weight
                  </label>
                  <div className="relative">
                    <Weight
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={newVitals.weight}
                      onChange={e =>
                        setNewVitals({ ...newVitals, weight: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="65"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">kg</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVitalsModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateVitals}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Update Vitals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
