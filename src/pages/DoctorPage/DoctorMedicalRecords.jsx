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
  Download,
  Printer,
  Eye,
  Archive,
} from 'lucide-react';

const DoctorMedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [medicalRecords, setMedicalRecords] = useState([
    {
      id: 1,
      recordNumber: 'MR-2025-001',
      patientName: 'John Smith',
      patientId: 'P001',
      age: 45,
      gender: 'Male',
      date: '2025-10-04',
      type: 'Follow-up',
      diagnosis: 'Hypertension - Stage 1',
      chiefComplaint: 'Regular blood pressure monitoring',
      vitals: { bp: '130/85', hr: '72', temp: '36.8', weight: '78' },
      prescription: 'Losartan 50mg - Take 1 tablet daily in the morning',
      labResults: 'Blood pressure trend showing improvement',
      notes:
        'Patient compliant with medication. Blood pressure improving. Continue current treatment plan. Advised to maintain low-sodium diet and regular exercise.',
      followUpDate: '2025-11-04',
      status: 'completed',
    },
    {
      id: 2,
      recordNumber: 'MR-2025-002',
      patientName: 'Maria Santos',
      patientId: 'P002',
      age: 32,
      gender: 'Female',
      date: '2025-10-04',
      type: 'Emergency',
      diagnosis: 'Acute Asthma Exacerbation',
      chiefComplaint: 'Severe shortness of breath and wheezing',
      vitals: { bp: '125/82', hr: '98', temp: '36.9', weight: '58' },
      prescription:
        'Salbutamol inhaler 2 puffs PRN, Prednisone 40mg daily for 5 days',
      labResults:
        'Oxygen saturation: 92% on room air, improved to 97% after nebulization',
      notes:
        'Patient presented with acute asthma attack. Responded well to nebulization treatment. Prescribed short course of oral steroids. Advised to avoid triggers and keep rescue inhaler accessible.',
      followUpDate: '2025-10-11',
      status: 'completed',
    },
    {
      id: 3,
      recordNumber: 'MR-2025-003',
      patientName: 'Robert Chen',
      patientId: 'P003',
      age: 58,
      gender: 'Male',
      date: '2025-10-03',
      type: 'Follow-up',
      diagnosis: 'Type 2 Diabetes Mellitus',
      chiefComplaint: 'Diabetes management and HbA1c review',
      vitals: { bp: '135/88', hr: '75', temp: '36.7', weight: '85' },
      prescription: 'Metformin 500mg - Take 1 tablet twice daily with meals',
      labResults: 'HbA1c: 7.2%, Fasting glucose: 135 mg/dL',
      notes:
        'HbA1c shows slight improvement from 7.8% to 7.2%. Patient reports better dietary compliance. Continue current medication. Encouraged weight loss and regular physical activity.',
      followUpDate: '2025-12-03',
      status: 'completed',
    },
    {
      id: 4,
      recordNumber: 'MR-2025-004',
      patientName: 'Anna Garcia',
      patientId: 'P004',
      age: 28,
      gender: 'Female',
      date: '2025-10-02',
      type: 'Check-up',
      diagnosis: 'Annual Physical Examination - Normal',
      chiefComplaint: 'Annual health screening',
      vitals: { bp: '115/75', hr: '65', temp: '36.6', weight: '55' },
      prescription: 'None required',
      labResults:
        'Complete blood count: Normal, Lipid panel: Optimal, Urinalysis: Normal',
      notes:
        'All examination findings within normal limits. Patient in excellent health. Encouraged to maintain healthy lifestyle. No medications needed at this time.',
      followUpDate: '2026-10-02',
      status: 'completed',
    },
    {
      id: 5,
      recordNumber: 'MR-2025-005',
      patientName: 'Sofia Rodriguez',
      patientId: 'P005',
      age: 39,
      gender: 'Female',
      date: '2025-10-01',
      type: 'Consultation',
      diagnosis: 'Chronic Migraine',
      chiefComplaint: 'Recurring headaches, 3-4 times per week',
      vitals: { bp: '125/82', hr: '70', temp: '36.7', weight: '62' },
      prescription:
        'Sumatriptan 50mg PRN for acute attacks, Propranolol 40mg daily for prevention',
      labResults: 'Brain MRI: Normal, no abnormalities detected',
      notes:
        'Patient experiencing frequent migraines affecting quality of life. Started on prophylactic medication. Advised to maintain headache diary, identify triggers, ensure adequate sleep and hydration.',
      followUpDate: '2025-11-01',
      status: 'completed',
    },
    {
      id: 6,
      recordNumber: 'MR-2025-006',
      patientName: 'Michael Torres',
      patientId: 'P006',
      age: 44,
      gender: 'Male',
      date: '2025-09-30',
      type: 'Follow-up',
      diagnosis: 'Hypertension - Well Controlled',
      chiefComplaint: 'Blood pressure monitoring',
      vitals: { bp: '128/84', hr: '73', temp: '36.8', weight: '82' },
      prescription: 'Amlodipine 5mg - Continue once daily',
      labResults: 'Blood pressure readings consistently within target range',
      notes:
        'Excellent blood pressure control achieved. Patient has lost 3kg since last visit. Continue current medication and lifestyle modifications. Very compliant patient.',
      followUpDate: '2025-12-30',
      status: 'completed',
    },
  ]);

  const [newRecord, setNewRecord] = useState({
    patientName: '',
    diagnosis: '',
    chiefComplaint: '',
    vitals: { bp: '', hr: '', temp: '', weight: '' },
    prescription: '',
    labResults: '',
    notes: '',
    followUpDate: '',
    type: 'Consultation',
  });

  const patients = [
    { id: 'P001', name: 'John Smith', age: 45, gender: 'Male' },
    { id: 'P002', name: 'Maria Santos', age: 32, gender: 'Female' },
    { id: 'P003', name: 'Robert Chen', age: 58, gender: 'Male' },
    { id: 'P004', name: 'Anna Garcia', age: 28, gender: 'Female' },
    { id: 'P005', name: 'Sofia Rodriguez', age: 39, gender: 'Female' },
    { id: 'P006', name: 'Michael Torres', age: 44, gender: 'Male' },
  ];

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;

    let matchesDate = true;
    if (filterDate !== 'all') {
      const recordDate = new Date(record.date);
      const today = new Date();
      if (filterDate === 'today') {
        matchesDate = recordDate.toDateString() === today.toDateString();
      } else if (filterDate === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = recordDate >= weekAgo;
      } else if (filterDate === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = recordDate >= monthAgo;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const stats = {
    total: medicalRecords.length,
    today: medicalRecords.filter(
      r => r.date === new Date().toISOString().split('T')[0]
    ).length,
    thisWeek: medicalRecords.filter(r => {
      const recordDate = new Date(r.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    }).length,
    followUp: medicalRecords.filter(
      r =>
        new Date(r.followUpDate) <=
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  const createNewRecord = () => {
    if (selectedPatient && newRecord.diagnosis) {
      const patient = patients.find(p => p.id === selectedPatient);
      const newRecordData = {
        id: medicalRecords.length + 1,
        recordNumber: `MR-2025-${String(medicalRecords.length + 1).padStart(
          3,
          '0'
        )}`,
        patientName: patient.name,
        patientId: patient.id,
        age: patient.age,
        gender: patient.gender,
        date: new Date().toISOString().split('T')[0],
        ...newRecord,
        status: 'completed',
      };
      setMedicalRecords([newRecordData, ...medicalRecords]);
      setNewRecord({
        patientName: '',
        diagnosis: '',
        chiefComplaint: '',
        vitals: { bp: '', hr: '', temp: '', weight: '' },
        prescription: '',
        labResults: '',
        notes: '',
        followUpDate: '',
        type: 'Consultation',
      });
      setSelectedPatient(null);
      setShowCreateModal(false);
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Medical Records
            </h2>
            <p className="text-gray-600">
              Create, view, and manage patient medical records
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            Create New Record
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Records
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Created Today
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.today}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">This Week</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.thisWeek}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Follow-up Due
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.followUp}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="text-orange-600" size={24} />
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
                  placeholder="Search by patient name, record number, or diagnosis..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
                <option value="Check-up">Check-up</option>
              </select>
              <select
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="space-y-3">
          {filteredRecords.map(record => (
            <div
              key={record.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {record.patientName}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                        {record.type}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                        {record.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {record.recordNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {record.date}
                      </span>
                      <span>
                        {record.age} years • {record.gender}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Diagnosis
                      </p>
                      <p className="text-sm text-gray-800">
                        {record.diagnosis}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>Follow-up: {record.followUpDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setShowRecordModal(true);
                    }}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Record Modal */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Medical Record
                  </h3>
                  <p className="text-blue-100">{selectedRecord.recordNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors">
                    <Download size={20} />
                  </button>
                  <button className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors">
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={() => setShowRecordModal(false)}
                    className="p-2 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Patient Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">
                      {selectedRecord.patientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient ID</p>
                    <p className="font-medium text-gray-800">
                      {selectedRecord.patientId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium text-gray-800">
                      {selectedRecord.age} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium text-gray-800">
                      {selectedRecord.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-800">
                      {selectedRecord.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-800">
                      {selectedRecord.type}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Follow-up Date</p>
                    <p className="font-medium text-gray-800">
                      {selectedRecord.followUpDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Chief Complaint
                </h4>
                <p className="text-gray-700">{selectedRecord.chiefComplaint}</p>
              </div>

              {/* Vital Signs */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-green-600" />
                  Vital Signs
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <Heart className="text-red-500 mx-auto mb-2" size={20} />
                    <p className="text-xs text-gray-600">Blood Pressure</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedRecord.vitals.bp}
                    </p>
                    <p className="text-xs text-gray-500">mmHg</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <Activity
                      className="text-pink-500 mx-auto mb-2"
                      size={20}
                    />
                    <p className="text-xs text-gray-600">Heart Rate</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedRecord.vitals.hr}
                    </p>
                    <p className="text-xs text-gray-500">bpm</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <Activity
                      className="text-orange-500 mx-auto mb-2"
                      size={20}
                    />
                    <p className="text-xs text-gray-600">Temperature</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedRecord.vitals.temp}
                    </p>
                    <p className="text-xs text-gray-500">°C</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <Activity
                      className="text-blue-500 mx-auto mb-2"
                      size={20}
                    />
                    <p className="text-xs text-gray-600">Weight</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedRecord.vitals.weight}
                    </p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-yellow-600" />
                  Diagnosis
                </h4>
                <p className="text-gray-800 font-medium">
                  {selectedRecord.diagnosis}
                </p>
              </div>

              {/* Lab Results */}
              {selectedRecord.labResults && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Laboratory Results
                  </h4>
                  <p className="text-gray-700">{selectedRecord.labResults}</p>
                </div>
              )}

              {/* Prescription */}
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-purple-600" />
                  Prescription
                </h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedRecord.prescription}
                </p>
              </div>

              {/* Medical Notes */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Medical Notes
                </h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedRecord.notes}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <button
                onClick={() => setShowRecordModal(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Create Medical Record
                  </h3>
                  <p className="text-blue-100 mt-1">
                    Complete patient medical documentation
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Select Patient */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Patient *
                </label>
                <select
                  value={selectedPatient || ''}
                  onChange={e => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a patient...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.age} years, {patient.gender}
                    </option>
                  ))}
                </select>
              </div>

              {/* Record Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Record Type *
                </label>
                <select
                  value={newRecord.type}
                  onChange={e =>
                    setNewRecord({ ...newRecord, type: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Check-up">Check-up</option>
                </select>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chief Complaint *
                </label>
                <textarea
                  value={newRecord.chiefComplaint}
                  onChange={e =>
                    setNewRecord({
                      ...newRecord,
                      chiefComplaint: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Patient's main complaint or reason for visit..."
                  rows="2"
                />
              </div>

              {/* Vital Signs */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity size={18} className="text-green-600" />
                  Vital Signs
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      value={newRecord.vitals.bp}
                      onChange={e =>
                        setNewRecord({
                          ...newRecord,
                          vitals: { ...newRecord.vitals, bp: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="text"
                      value={newRecord.vitals.hr}
                      onChange={e =>
                        setNewRecord({
                          ...newRecord,
                          vitals: { ...newRecord.vitals, hr: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°C)
                    </label>
                    <input
                      type="text"
                      value={newRecord.vitals.temp}
                      onChange={e =>
                        setNewRecord({
                          ...newRecord,
                          vitals: { ...newRecord.vitals, temp: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="36.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="text"
                      value={newRecord.vitals.weight}
                      onChange={e =>
                        setNewRecord({
                          ...newRecord,
                          vitals: {
                            ...newRecord.vitals,
                            weight: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="65"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
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
                  placeholder="Enter detailed diagnosis..."
                  rows="3"
                />
              </div>

              {/* Lab Results */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Laboratory Results
                </label>
                <textarea
                  value={newRecord.labResults}
                  onChange={e =>
                    setNewRecord({ ...newRecord, labResults: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter lab test results and findings..."
                  rows="2"
                />
              </div>

              {/* Prescription */}
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
                  placeholder="Medication name, dosage, frequency, and instructions..."
                  rows="3"
                />
              </div>

              {/* Medical Notes */}
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
                  placeholder="Additional observations, recommendations, and treatment plan..."
                  rows="4"
                />
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={newRecord.followUpDate}
                  onChange={e =>
                    setNewRecord({ ...newRecord, followUpDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewRecord}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Create Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;
