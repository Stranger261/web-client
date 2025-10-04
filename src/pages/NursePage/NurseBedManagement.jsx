import { useState, useEffect } from 'react';
import { Users, Activity, Wrench, Sparkles, Plus, Search } from 'lucide-react';

// Mock API calls - replace with actual API
const mockAPI = {
  getBedStats: async () => ({
    total: 18,
    occupied: 6,
    available: 9,
    cleaning: 2,
    maintenance: 1,
    occupancyRate: 33.3,
  }),

  getWardOverview: async () => [
    {
      ward: 'General Ward',
      total: 6,
      occupied: 2,
      available: 3,
      cleaning: 1,
      maintenance: 0,
      occupancyRate: 33.3,
    },
    {
      ward: 'Private Wing',
      total: 3,
      occupied: 1,
      available: 2,
      cleaning: 0,
      maintenance: 0,
      occupancyRate: 33.3,
    },
    {
      ward: 'ICU',
      total: 4,
      occupied: 2,
      available: 1,
      cleaning: 0,
      maintenance: 1,
      occupancyRate: 50,
    },
    {
      ward: 'Emergency Room',
      total: 3,
      occupied: 1,
      available: 2,
      cleaning: 0,
      maintenance: 0,
      occupancyRate: 33.3,
    },
  ],

  getAllBeds: async () => [
    {
      _id: '1',
      bedNumber: 'B-301-1',
      ward: 'General Ward',
      wardType: 'General',
      room: '301',
      floor: 3,
      status: 'Available',
      dailyRate: 1500,
    },
    {
      _id: '2',
      bedNumber: 'B-301-2',
      ward: 'General Ward',
      wardType: 'General',
      room: '301',
      floor: 3,
      status: 'Occupied',
      dailyRate: 1500,
      currentPatient: { name: 'Juan Dela Cruz' },
    },
    {
      _id: '3',
      bedNumber: 'B-302-1',
      ward: 'General Ward',
      wardType: 'General',
      room: '302',
      floor: 3,
      status: 'Available',
      dailyRate: 1500,
    },
    {
      _id: '4',
      bedNumber: 'B-401-1',
      ward: 'Private Wing',
      wardType: 'Private',
      room: '401',
      floor: 4,
      status: 'Available',
      dailyRate: 3500,
    },
    {
      _id: '5',
      bedNumber: 'B-402-1',
      ward: 'Private Wing',
      wardType: 'Private',
      room: '402',
      floor: 4,
      status: 'Occupied',
      dailyRate: 3500,
      currentPatient: { name: 'Maria Santos' },
    },
    {
      _id: '6',
      bedNumber: 'ICU-201-1',
      ward: 'ICU',
      wardType: 'ICU',
      room: '201',
      floor: 2,
      status: 'Occupied',
      dailyRate: 5000,
      currentPatient: { name: 'Pedro Reyes' },
    },
    {
      _id: '7',
      bedNumber: 'ICU-201-2',
      ward: 'ICU',
      wardType: 'ICU',
      room: '201',
      floor: 2,
      status: 'Available',
      dailyRate: 5000,
    },
    {
      _id: '8',
      bedNumber: 'B-303-1',
      ward: 'General Ward',
      wardType: 'General',
      room: '303',
      floor: 3,
      status: 'Cleaning',
      dailyRate: 1500,
    },
  ],
};

const NurseBedManagement = () => {
  const [stats, setStats] = useState(null);
  const [wardOverview, setWardOverview] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, wardData, bedsData] = await Promise.all([
        mockAPI.getBedStats(),
        mockAPI.getWardOverview(),
        mockAPI.getAllBeds(),
      ]);
      setStats(statsData);
      setWardOverview(wardData);
      setBeds(bedsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBeds = beds.filter(bed => {
    const matchesWard = selectedWard === 'All' || bed.ward === selectedWard;
    const matchesStatus =
      selectedStatus === 'All' || bed.status === selectedStatus;
    const matchesSearch =
      bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.room.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWard && matchesStatus && matchesSearch;
  });

  const getStatusColor = status => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Occupied':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Cleaning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Under Maintenance':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'Occupied':
        return '🛏️';
      case 'Available':
        return '✅';
      case 'Cleaning':
        return '🧹';
      case 'Under Maintenance':
        return '🔧';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bed management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bed Management</h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage hospital bed availability
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Beds</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              🛏️
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Occupied</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.occupied}
              </p>
            </div>
            <Users className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Available</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.available}
              </p>
            </div>
            <Activity className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cleaning</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.cleaning}
              </p>
            </div>
            <Sparkles className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Occupancy</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.occupancyRate}%
              </p>
            </div>
            <Wrench className="w-10 h-10 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Ward Overview */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ward Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wardOverview.map(ward => (
            <div
              key={ward.ward}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-800 mb-3">{ward.ward}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{ward.total} beds</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-medium text-red-600">
                    {ward.occupied}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-green-600">
                    {ward.available}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Occupancy</span>
                    <span className="text-sm font-bold text-blue-600">
                      {ward.occupancyRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${ward.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by bed number or room..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedWard}
            onChange={e => setSelectedWard(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>General Ward</option>
            <option>Private Wing</option>
            <option>ICU</option>
            <option>Emergency Room</option>
          </select>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>Available</option>
            <option>Occupied</option>
            <option>Cleaning</option>
            <option>Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Beds Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            All Beds ({filteredBeds.length})
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Add New Bed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBeds.map(bed => (
            <div
              key={bed._id}
              className={`border-2 rounded-lg p-4 transition-all hover:shadow-lg ${getStatusColor(
                bed.status
              )}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {bed.bedNumber}
                  </p>
                  <p className="text-sm text-gray-600">{bed.ward}</p>
                  <p className="text-xs text-gray-500">
                    Room {bed.room} • Floor {bed.floor}
                  </p>
                </div>
                <span className="text-2xl">{getStatusIcon(bed.status)}</span>
              </div>

              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getStatusColor(
                  bed.status
                )}`}
              >
                {bed.status}
              </div>

              {bed.currentPatient && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-xs text-gray-600">Patient:</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {bed.currentPatient.name}
                  </p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-600">Daily Rate:</p>
                <p className="text-lg font-bold text-blue-600">
                  ₱{bed.dailyRate.toLocaleString()}
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                {bed.status === 'Available' && (
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Assign
                  </button>
                )}
                {bed.status === 'Cleaning' && (
                  <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                    Mark Clean
                  </button>
                )}
                {bed.status === 'Occupied' && (
                  <button className="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700">
                    Transfer
                  </button>
                )}
                <button className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBeds.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No beds found matching your criteria</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseBedManagement;
