import { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Edit,
  Trash2,
  Lock,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import LoadingOverlay from '../../components/generic/LoadingOverlay';
import { useEffect } from 'react';
import { formatDateForInput } from '../../utils/dateFormatter';

const AdminUserManagement = () => {
  const {
    // State from context
    users,
    departments,
    userStatistics,
    isLoading,
    error,
    selectedRole,
    setSelectedRole,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalUsers,

    // Methods from context
    createNewUser,
    updateExistingUser,
    deleteExistingUser,
    fetchDepartmentRoles,
    clearError,
    fetchUsers,
  } = useAuth();

  const [modalMode, setModalMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    middlename: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    zipCode: '',
    department: '',
    role: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allRoles = ['receptionist', 'nurse', 'doctor', 'admin', 'superadmin'];
  const safeValue = val => val ?? '';

  // Role statistics from context or calculate from users
  const roleStats = [
    {
      role: 'Doctor',
      count:
        userStatistics?.byRole?.doctor ||
        users.filter(u => u.role === 'doctor').length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      role: 'Nurse',
      count:
        userStatistics?.byRole?.nurse ||
        users.filter(u => u.role === 'nurse').length,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      role: 'Receptionist',
      count:
        userStatistics?.byRole?.receptionist ||
        users.filter(u => u.role === 'receptionist').length,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      role: 'Admin',
      count:
        userStatistics?.byRole?.admin ||
        users.filter(u => ['admin', 'superadmin'].includes(u.role)).length,
      icon: Users,
      color: 'bg-red-500',
    },
    {
      role: 'Total',
      count: userStatistics?.total || users.length,
      icon: Users,
      color: 'bg-gray-500',
    },
  ];

  const getStatusColor = status => {
    return status === 'Active' || status === true
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getRoleBadgeColor = role => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      superadmin: 'bg-red-100 text-red-800',
      doctor: 'bg-blue-100 text-blue-800',
      nurse: 'bg-green-100 text-green-800',
      receptionist: 'bg-purple-100 text-purple-800',
      patient: 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const handleDepartmentChange = async dept => {
    setFormData(prev => ({
      ...prev,
      department: dept,
      role: '',
    }));

    // Fetch available roles for the selected department
    if (dept) {
      try {
        const roles = await fetchDepartmentRoles(dept);
        console.log('Available roles for department:', roles);
        setAvailableRoles(roles || []);
      } catch (error) {
        console.error('Error fetching department roles:', error);
        setAvailableRoles([]);
      }
    } else {
      setAvailableRoles([]);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setAvailableRoles([]);
    setFormData({
      firstname: '',
      lastname: '',
      middlename: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      zipCode: '',
      department: '',
      role: '',
      password: '',
      confirmPassword: '',
      status: 'Active',
    });
  };

  const openEditModal = async user => {
    setModalMode('edit');
    setSelectedUser(user);

    // Determine the department ID
    const deptId = user.departmentDetails?._id || user.department;

    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      middlename: user.middlename || '',
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      address: user.address || '',
      city: user.city || '',
      zipCode: user.zipCode || '',
      department: deptId,
      role: user.role,
      password: '',
      confirmPassword: '',
      status: user.isActive ? 'Active' : 'Inactive',
    });

    // Fetch available roles for this department
    if (deptId) {
      try {
        const roles = await fetchDepartmentRoles(deptId);
        setAvailableRoles(roles || []);
      } catch (error) {
        console.error('Error fetching department roles:', error);
        setAvailableRoles([]);
      }
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setAvailableRoles([]);
    setFormData({
      firstname: '',
      lastname: '',
      middlename: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      zipCode: '',
      department: '',
      role: '',
      password: '',
      confirmPassword: '',
      status: 'Active',
    });
  };

  const handleSubmit = async () => {
    if (!formData.firstname || !formData.lastname || !formData.email) {
      toast.error('Please fill all required fields.');
      return;
    }

    if (!formData.department && modalMode === 'add') {
      toast.error('Please select a department first!');
      return;
    }

    if (!formData.role && modalMode === 'add') {
      toast.error('Please select a role!');
      return;
    }

    if (modalMode === 'add') {
      if (!formData.password || formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const userData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        middlename: formData.middlename,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        department: formData.department,
        role: formData.role,
        isActive: formData.status === 'Active',
      };

      if (modalMode === 'add') {
        userData.password = formData.password;
        const result = await createNewUser(userData);
        toast.success(result?.message || result?.data?.message);
      } else {
        const result = await updateExistingUser(selectedUser._id, userData);
        toast.success(result?.message || result?.data?.message);
      }

      closeModal();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async userId => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const result = await deleteExistingUser(userId);
      alert(result.message);
    } catch (error) {
      alert(error.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch =
      `${user.firstname} ${user.lastname}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  useEffect(() => {
    const loadUsers = async () => {
      // if role is 'all', fetch everything at once
      if (selectedRole === 'all') await fetchUsers();
    };

    loadUsers();
  }, []);

  return isLoading ? (
    <LoadingOverlay />
  ) : (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Manage system users, roles, and permissions
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 text-sm mb-1">Error</h4>
            <p className="text-xs text-red-800">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
        {roleStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${stat.color} p-2 md:p-3 rounded-lg`}>
                <stat.icon className="text-white" size={16} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {stat.count}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">{stat.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4 md:items-end">
          <div className="flex-1 min-w-full md:min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={e => !modalMode && setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            >
              <option value="all">All Roles</option>
              {allRoles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={openAddModal}
            disabled={isLoading}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <UserPlus size={18} />
            )}
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      {isLoading || filteredUsers.length === 0 ? (
        <LoadingOverlay />
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">
                      Name
                    </th>
                    <th className="text-left py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm hidden lg:table-cell">
                      Email
                    </th>
                    <th className="text-left py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">
                      Role
                    </th>
                    <th className="text-left py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm hidden md:table-cell">
                      Department
                    </th>
                    <th className="text-center py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">
                      Status
                    </th>
                    <th className="text-center py-3 px-2 md:px-4 font-semibold text-gray-700 text-xs md:text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-12 text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-2 md:px-4 font-medium text-gray-900 text-xs md:text-sm">
                          {user.firstname} {user.lastname}
                        </td>
                        <td className="py-3 px-2 md:px-4 text-gray-700 text-xs md:text-sm hidden lg:table-cell">
                          {user.email}
                        </td>
                        <td className="py-3 px-2 md:px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-2 md:px-4 text-gray-700 text-xs md:text-sm hidden md:table-cell">
                          {user.departmentDetails?.name ||
                            user.department ||
                            'N/A'}
                        </td>
                        <td className="py-3 px-2 md:px-4 text-center">
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              user.isActive
                            )}`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-2 md:px-4">
                          <div className="flex items-center justify-center gap-1 md:gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit User"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs md:text-sm text-gray-600">
        Showing {filteredUsers.length} of {totalUsers} users
      </div>

      {/* Reusable Modal for Add/Edit */}
      {modalMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={safeValue(formData.firstname)}
                      onChange={e =>
                        setFormData({ ...formData, firstname: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={safeValue(formData.middlename)}
                      onChange={e =>
                        setFormData({ ...formData, middlename: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Santos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={safeValue(formData.lastname)}
                      onChange={e =>
                        setFormData({ ...formData, lastname: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dela Cruz"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={safeValue(formData.email)}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@hospital.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={safeValue(formData.phone)}
                      onChange={e =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+63 917 XXX XXXX"
                    />
                  </div>
                </div>

                {/* Gender and Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={safeValue(formData.gender)}
                      onChange={e =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select gender...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={safeValue(
                        formatDateForInput(formData.dateOfBirth)
                      )}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Department and Role - CRITICAL SECTION */}
                {selectedUser?.role !== 'patient' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={safeValue(formData.department)}
                        onChange={e => handleDepartmentChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select department first...</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={safeValue(formData.role)}
                        onChange={e =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        disabled={!formData.department}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {formData.department
                            ? 'Select role...'
                            : 'Select department first'}
                        </option>
                        {availableRoles.map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                      {!formData.department && (
                        <p className="text-xs text-amber-600 mt-1">
                          Please select a department first to see available
                          roles
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status - Only for Edit Mode */}
                {modalMode === 'edit' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={safeValue(formData.status)}
                        onChange={e =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Password Fields - Only for Add Mode */}
                {modalMode === 'add' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={safeValue(formData.password)}
                        onChange={e =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Minimum 8 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={safeValue(formData.confirmPassword)}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                )}

                {/* Account Info - Only for Edit Mode */}
                {modalMode === 'edit' && selectedUser && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      Account Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">User ID:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedUser._id}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(
                            selectedUser.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedUser.lastLogin && (
                        <div>
                          <span className="text-gray-600">Last Login:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(selectedUser.lastLogin).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">
                      Role Assignment Based on Department
                    </h4>
                    <p className="text-xs text-blue-800">
                      Select a department first to see available roles.
                      Permissions will be automatically assigned based on the
                      selected role.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    disabled={isLoading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        {modalMode === 'add' && <UserPlus size={18} />}
                        {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
