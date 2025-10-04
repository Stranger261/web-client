import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  Settings,
  Download,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Bell,
  Eye,
  Heart,
  Droplet,
  Thermometer,
  Pill,
  Stethoscope,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
const PatientMedicalRecord = () => {
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Patient's own data
  const patientInfo = {
    name: 'John Smith',
    patientId: 'P-2025-001',
    age: 45,
    gender: 'Male',
    bloodType: 'O+',
    email: 'john.smith@email.com',
    phone: '+63 917 123 4567',
    address: '123 Main Street, Quezon City',
    dateOfBirth: '1980-03-15',
    emergencyContact: 'Jane Smith - Wife',
    emergencyPhone: '+63 917 765 4321',
    allergies: ['Penicillin', 'Shellfish'],
    chronicConditions: ['Hypertension', 'High Cholesterol'],
    primaryPhysician: 'Dr. Sarah Anderson',
    insuranceProvider: 'PhilHealth',
    insuranceNumber: 'PH-123456789',
  };

  const medicalHistory = [
    {
      id: 1,
      date: '2025-10-04',
      time: '14:30',
      type: 'Consultation',
      provider: 'Dr. Sarah Anderson',
      department: 'Internal Medicine',
      chiefComplaint: 'Regular blood pressure monitoring',
      diagnosis: 'Hypertension - Stage 1, well controlled',
      vitals: {
        bp: '130/85 mmHg',
        hr: '72 bpm',
        temp: '36.8°C',
        weight: '78 kg',
        height: '175 cm',
      },
      prescription: [
        {
          medication: 'Losartan',
          dosage: '50mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning with food',
        },
      ],
      labResults: [
        {
          test: 'Blood Pressure Monitoring',
          result: 'Within target range',
          status: 'normal',
        },
      ],
      notes:
        'Patient compliant with medication. Blood pressure improving. Continue current treatment plan. Advised to maintain low-sodium diet and regular exercise.',
      followUp: '2025-11-04',
      documents: ['Blood Pressure Log', 'Prescription'],
    },
    {
      id: 2,
      date: '2025-09-20',
      time: '10:00',
      type: 'Follow-up',
      provider: 'Dr. Sarah Anderson',
      department: 'Internal Medicine',
      chiefComplaint: 'Hypertension follow-up',
      diagnosis: 'Hypertension - Stage 1',
      vitals: {
        bp: '135/88 mmHg',
        hr: '75 bpm',
        temp: '36.7°C',
        weight: '79 kg',
        height: '175 cm',
      },
      prescription: [
        {
          medication: 'Losartan',
          dosage: '50mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning with food',
        },
      ],
      labResults: [
        {
          test: 'Complete Blood Count',
          result: 'All values normal',
          status: 'normal',
        },
        {
          test: 'Lipid Panel',
          result: 'Cholesterol slightly elevated',
          status: 'attention',
        },
      ],
      notes:
        'Blood pressure responding to medication. Advised lifestyle modifications including diet and exercise.',
      followUp: '2025-10-20',
      documents: ['Lab Results', 'Prescription'],
    },
    {
      id: 3,
      date: '2025-08-15',
      time: '09:30',
      type: 'Initial Consultation',
      provider: 'Dr. Sarah Anderson',
      department: 'Internal Medicine',
      chiefComplaint: 'Elevated blood pressure readings at home',
      diagnosis: 'Newly diagnosed Hypertension - Stage 1',
      vitals: {
        bp: '142/92 mmHg',
        hr: '78 bpm',
        temp: '36.6°C',
        weight: '80 kg',
        height: '175 cm',
      },
      prescription: [
        {
          medication: 'Losartan',
          dosage: '50mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning with food',
        },
      ],
      labResults: [
        { test: 'ECG', result: 'Normal sinus rhythm', status: 'normal' },
        { test: 'Complete Blood Count', result: 'Normal', status: 'normal' },
        { test: 'Basic Metabolic Panel', result: 'Normal', status: 'normal' },
      ],
      notes:
        'Started on antihypertensive medication. Patient education provided regarding lifestyle modifications, diet, and exercise.',
      followUp: '2025-09-15',
      documents: [
        'ECG Report',
        'Lab Results',
        'Prescription',
        'Patient Education Materials',
      ],
    },
    {
      id: 4,
      date: '2025-07-10',
      time: '11:00',
      type: 'Procedure',
      provider: 'Dr. Michael Chen',
      department: 'Cardiology',
      chiefComplaint: 'Routine cardiac screening',
      diagnosis: 'Cardiac screening - No abnormalities detected',
      vitals: {
        bp: '138/85 mmHg',
        hr: '74 bpm',
        temp: '36.8°C',
        weight: '80 kg',
        height: '175 cm',
      },
      prescription: [],
      labResults: [
        {
          test: 'Echocardiogram',
          result: 'Normal cardiac function',
          status: 'normal',
        },
        { test: 'Stress Test', result: 'Normal response', status: 'normal' },
      ],
      notes:
        'Cardiac screening completed. Heart function normal. Recommend regular monitoring due to family history.',
      followUp: '2026-07-10',
      documents: ['Echocardiogram Report', 'Stress Test Results'],
    },
    {
      id: 5,
      date: '2024-10-05',
      time: '14:00',
      type: 'Annual Check-up',
      provider: 'Dr. Sarah Anderson',
      department: 'Internal Medicine',
      chiefComplaint: 'Annual physical examination',
      diagnosis: 'General health assessment - Good overall health',
      vitals: {
        bp: '135/82 mmHg',
        hr: '70 bpm',
        temp: '36.7°C',
        weight: '79 kg',
        height: '175 cm',
      },
      prescription: [],
      labResults: [
        { test: 'Complete Blood Count', result: 'Normal', status: 'normal' },
        {
          test: 'Comprehensive Metabolic Panel',
          result: 'Normal',
          status: 'normal',
        },
        {
          test: 'Lipid Panel',
          result: 'Borderline high cholesterol',
          status: 'attention',
        },
      ],
      notes:
        'Overall good health. Blood pressure borderline high. Advised to monitor and consider lifestyle changes.',
      followUp: '2025-10-05',
      documents: ['Annual Physical Report', 'Lab Results'],
    },
  ];

  const filteredHistory = medicalHistory.filter(
    record => filterType === 'all' || record.type === filterType
  );

  const getTypeColor = type => {
    switch (type) {
      case 'Consultation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Follow-up':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Initial Consultation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Procedure':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Annual Check-up':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'attention':
        return 'text-yellow-600';
      case 'urgent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className=" px-16 py-4 border-b bg-base-100 border-base-300 shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {patientInfo.name}
              </h1>
              <p className="text-sm text-gray-600">
                Patient Portal • {patientInfo.patientId}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              My Medical History
            </h2>
            <p className="text-gray-600">
              View your complete medical records and health information
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download size={18} />
            Download All Records
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Patient Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full">
                  <User className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {patientInfo.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {patientInfo.patientId}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                    Personal Information
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age</span>
                      <span className="font-medium text-gray-800">
                        {patientInfo.age} years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender</span>
                      <span className="font-medium text-gray-800">
                        {patientInfo.gender}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Type</span>
                      <span className="font-medium text-gray-800">
                        {patientInfo.bloodType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth</span>
                      <span className="font-medium text-gray-800">
                        {patientInfo.dateOfBirth}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                    Contact Information
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={14} />
                      <span>{patientInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={14} />
                      <span>{patientInfo.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                    Allergies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {patientInfo.allergies.map((allergy, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-200"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                    Chronic Conditions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {patientInfo.chronicConditions.map((condition, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-200"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                    Primary Care
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-gray-800">
                      {patientInfo.primaryPhysician}
                    </p>
                    <p className="text-gray-600">Internal Medicine</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                    Insurance
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-gray-800">
                      {patientInfo.insuranceProvider}
                    </p>
                    <p className="text-gray-600">
                      {patientInfo.insuranceNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History Timeline */}
          <div className="lg:col-span-2">
            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-600" size={18} />
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Records</option>
                  <option value="Consultation">Consultations</option>
                  <option value="Follow-up">Follow-ups</option>
                  <option value="Procedure">Procedures</option>
                  <option value="Annual Check-up">Annual Check-ups</option>
                </select>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {filteredHistory.map(record => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Record Header */}
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(
                              record.type
                            )}`}
                          >
                            {record.type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {record.department}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {record.diagnosis}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {record.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {record.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Stethoscope size={14} />
                            {record.provider}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedRecord(
                            expandedRecord === record.id ? null : record.id
                          )
                        }
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        {expandedRecord === record.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRecord === record.id && (
                    <div className="p-5 space-y-5">
                      {/* Chief Complaint */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                          Chief Complaint
                        </h4>
                        <p className="text-gray-800">{record.chiefComplaint}</p>
                      </div>

                      {/* Vital Signs */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3 flex items-center gap-2">
                          <Activity className="text-green-600" size={16} />
                          Vital Signs
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Heart className="text-red-500" size={16} />
                              <p className="text-xs text-gray-600">
                                Blood Pressure
                              </p>
                            </div>
                            <p className="font-bold text-gray-800">
                              {record.vitals.bp}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="text-pink-500" size={16} />
                              <p className="text-xs text-gray-600">
                                Heart Rate
                              </p>
                            </div>
                            <p className="font-bold text-gray-800">
                              {record.vitals.hr}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Thermometer
                                className="text-orange-500"
                                size={16}
                              />
                              <p className="text-xs text-gray-600">
                                Temperature
                              </p>
                            </div>
                            <p className="font-bold text-gray-800">
                              {record.vitals.temp}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="text-blue-500" size={16} />
                              <p className="text-xs text-gray-600">Weight</p>
                            </div>
                            <p className="font-bold text-gray-800">
                              {record.vitals.weight}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="text-purple-500" size={16} />
                              <p className="text-xs text-gray-600">Height</p>
                            </div>
                            <p className="font-bold text-gray-800">
                              {record.vitals.height}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Lab Results */}
                      {record.labResults.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                            Laboratory Results
                          </h4>
                          <div className="space-y-2">
                            {record.labResults.map((lab, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {lab.test}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {lab.result}
                                    </p>
                                  </div>
                                  <CheckCircle
                                    className={getStatusColor(lab.status)}
                                    size={20}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescription */}
                      {record.prescription.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3 flex items-center gap-2">
                            <Pill className="text-purple-600" size={16} />
                            Prescription
                          </h4>
                          <div className="space-y-3">
                            {record.prescription.map((med, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-lg p-3"
                              >
                                <p className="font-bold text-gray-800 mb-2">
                                  {med.medication} - {med.dosage}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-gray-600">Frequency</p>
                                    <p className="font-medium text-gray-800">
                                      {med.frequency}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Duration</p>
                                    <p className="font-medium text-gray-800">
                                      {med.duration}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-gray-600">
                                      Instructions
                                    </p>
                                    <p className="font-medium text-gray-800">
                                      {med.instructions}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doctor's Notes */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                          Doctor's Notes
                        </h4>
                        <p className="text-gray-800">{record.notes}</p>
                      </div>

                      {/* Follow-up */}
                      {record.followUp && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-yellow-600" size={18} />
                            <div>
                              <p className="text-sm text-gray-600">
                                Follow-up Appointment
                              </p>
                              <p className="font-bold text-gray-800">
                                {record.followUp}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      {record.documents.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                            Documents
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {record.documents.map((doc, idx) => (
                              <button
                                key={idx}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              >
                                <FileText size={14} />
                                {doc}
                                <Download size={14} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-3 border-t border-gray-200">
                        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                          <Download size={16} />
                          Download Record
                        </button>
                        <button className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                          <Printer size={16} />
                          Print Record
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PatientMedicalRecord;
