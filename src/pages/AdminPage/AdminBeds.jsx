import React, { useState } from 'react';
import {
  Bed,
  UserPlus,
  Edit2,
  Trash2,
  Filter,
  Search,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

const AdminBeds = () => {
  const [beds, setBeds] = useState([
    {
      id: 1,
      bedNumber: 'A101',
      ward: 'ICU',
      floor: 1,
      status: 'occupied',
      patient: 'John Smith',
      admissionDate: '2025-10-01',
      condition: 'Critical',
    },
    {
      id: 2,
      bedNumber: 'A102',
      ward: 'ICU',
      floor: 1,
      status: 'available',
      patient: null,
      admissionDate: null,
      condition: null,
    },
    {
      id: 3,
      bedNumber: 'B201',
      ward: 'General',
      floor: 2,
      status: 'occupied',
      patient: 'Sarah Johnson',
      admissionDate: '2025-10-03',
      condition: 'Stable',
    },
    {
      id: 4,
      bedNumber: 'B202',
      ward: 'General',
      floor: 2,
      status: 'maintenance',
      patient: null,
      admissionDate: null,
      condition: null,
    },
    {
      id: 5,
      bedNumber: 'C301',
      ward: 'Pediatrics',
      floor: 3,
      status: 'occupied',
      patient: 'Emma Davis',
      admissionDate: '2025-10-02',
      condition: 'Recovering',
    },
    {
      id: 6,
      bedNumber: 'C302',
      ward: 'Pediatrics',
      floor: 3,
      status: 'available',
      patient: null,
      admissionDate: null,
      condition: null,
    },
    {
      id: 7,
      bedNumber: 'D401',
      ward: 'Maternity',
      floor: 4,
      status: 'occupied',
      patient: 'Lisa Brown',
      admissionDate: '2025-10-04',
      condition: 'Stable',
    },
    {
      id: 8,
      bedNumber: 'D402',
      ward: 'Maternity',
      floor: 4,
      status: 'available',
      patient: null,
      admissionDate: null,
      condition: null,
    },
  ]);

  const [filterWard, setFilterWard] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [bedFormData, setBedFormData] = useState({
    bedNumber: '',
    ward: 'ICU',
    floor: 1,
  });
  const [patientFormData, setPatientFormData] = useState({
    patientName: '',
    admissionDate: '',
    condition: 'Stable',
  });

  const wards = [
    'ICU',
    'General',
    'Pediatrics',
    'Maternity',
    'Surgery',
    'Emergency',
  ];

  const filteredBeds = beds.filter(bed => {
    const matchesWard = filterWard === 'all' || bed.ward === filterWard;
    const matchesStatus = filterStatus === 'all' || bed.status === filterStatus;
    const matchesSearch =
      bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bed.patient &&
        bed.patient.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesWard && matchesStatus && matchesSearch;
  });

  const bedStats = {
    total: beds.length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    available: beds.filter(b => b.status === 'available').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
  };

  const getStatusColor = status => {
    switch (status) {
      case 'occupied':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'available':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'occupied':
        return <AlertCircle className="w-4 h-4" />;
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'maintenance':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleAddBed = () => {
    if (!bedFormData.bedNumber) return;
    const newBed = {
      id: beds.length + 1,
      bedNumber: bedFormData.bedNumber,
      ward: bedFormData.ward,
      floor: bedFormData.floor,
      status: 'available',
      patient: null,
      admissionDate: null,
      condition: null,
    };
    setBeds([...beds, newBed]);
    setShowAddModal(false);
    setBedFormData({ bedNumber: '', ward: 'ICU', floor: 1 });
  };

  const handleAssignPatient = () => {
    if (!patientFormData.patientName || !patientFormData.admissionDate) return;
    setBeds(
      beds.map(bed =>
        bed.id === selectedBed.id
          ? {
              ...bed,
              status: 'occupied',
              patient: patientFormData.patientName,
              admissionDate: patientFormData.admissionDate,
              condition: patientFormData.condition,
            }
          : bed
      )
    );
    setShowAssignModal(false);
    setSelectedBed(null);
    setPatientFormData({
      patientName: '',
      admissionDate: '',
      condition: 'Stable',
    });
  };

  const handleDischarge = bedId => {
    setBeds(
      beds.map(bed =>
        bed.id === bedId
          ? {
              ...bed,
              status: 'available',
              patient: null,
              admissionDate: null,
              condition: null,
            }
          : bed
      )
    );
  };

  const handleStatusChange = (bedId, newStatus) => {
    setBeds(
      beds.map(bed => (bed.id === bedId ? { ...bed, status: newStatus } : bed))
    );
  };

  const handleDeleteBed = bedId => {
    if (confirm('Are you sure you want to delete this bed?')) {
      setBeds(beds.filter(bed => bed.id !== bedId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bed className="w-8 h-8 text-blue-600" />
                Bed Management System
              </h1>
              <p className="text-gray-600 mt-1">
                Manage hospital bed allocation and availability
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add New Bed
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Beds</div>
              <div className="text-2xl font-bold text-gray-900">
                {bedStats.total}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
              <div className="text-sm text-green-600 mb-1">Available</div>
              <div className="text-2xl font-bold text-green-700">
                {bedStats.available}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
              <div className="text-sm text-red-600 mb-1">Occupied</div>
              <div className="text-2xl font-bold text-red-700">
                {bedStats.occupied}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
              <div className="text-sm text-yellow-600 mb-1">Maintenance</div>
              <div className="text-2xl font-bold text-yellow-700">
                {bedStats.maintenance}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={filterWard}
              onChange={e => setFilterWard(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Wards</option>
              {wards.map(ward => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by bed number or patient name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bed List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bed Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Floor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBeds.map(bed => (
                  <tr key={bed.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {bed.bedNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bed.ward}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Floor {bed.floor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          bed.status
                        )}`}
                      >
                        {getStatusIcon(bed.status)}
                        {bed.status.charAt(0).toUpperCase() +
                          bed.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bed.patient || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bed.admissionDate || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bed.condition || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {bed.status === 'available' && (
                          <button
                            onClick={() => {
                              setSelectedBed(bed);
                              setShowAssignModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Assign Patient"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        {bed.status === 'occupied' && (
                          <button
                            onClick={() => handleDischarge(bed.id)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Discharge Patient"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <select
                          value={bed.status}
                          onChange={e =>
                            handleStatusChange(bed.id, e.target.value)
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          title="Change Status"
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                        <button
                          onClick={() => handleDeleteBed(bed.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Bed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Bed Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Bed</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Number
                </label>
                <input
                  type="text"
                  value={bedFormData.bedNumber}
                  onChange={e =>
                    setBedFormData({
                      ...bedFormData,
                      bedNumber: e.target.value,
                    })
                  }
                  placeholder="e.g., A101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward
                </label>
                <select
                  value={bedFormData.ward}
                  onChange={e =>
                    setBedFormData({ ...bedFormData, ward: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {wards.map(ward => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <input
                  type="number"
                  value={bedFormData.floor}
                  onChange={e =>
                    setBedFormData({
                      ...bedFormData,
                      floor: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  placeholder="e.g., 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setBedFormData({ bedNumber: '', ward: 'ICU', floor: 1 });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBed}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Bed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Patient Modal */}
      {showAssignModal && selectedBed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Assign Patient to Bed {selectedBed.bedNumber}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientFormData.patientName}
                  onChange={e =>
                    setPatientFormData({
                      ...patientFormData,
                      patientName: e.target.value,
                    })
                  }
                  placeholder="Enter patient name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Date
                </label>
                <input
                  type="date"
                  value={patientFormData.admissionDate}
                  onChange={e =>
                    setPatientFormData({
                      ...patientFormData,
                      admissionDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={patientFormData.condition}
                  onChange={e =>
                    setPatientFormData({
                      ...patientFormData,
                      condition: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Critical">Critical</option>
                  <option value="Serious">Serious</option>
                  <option value="Stable">Stable</option>
                  <option value="Recovering">Recovering</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedBed(null);
                  setPatientFormData({
                    patientName: '',
                    admissionDate: '',
                    condition: 'Stable',
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPatient}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Assign Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBeds;
