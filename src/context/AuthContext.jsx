import { useEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  verifyUser,
  verifyUserFaceRecog,
  updateUser,
} from '../services/authApi';

import {
  getAllUsers,
  createUser,
  updateStaffUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getAllDepartments,
  getRolesByDepartment,
  getStaffStatistics,
} from '../services/staffApi';
import { useCallback } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // User Management State
  const [users, setUsers] = useState([]);
  const [userStatistics, setUserStatistics] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [error, setError] = useState(null);

  // Filter states
  const [itemsPerPage] = useState(10);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Department and Role State (fetched from backend)
  const [departments, setDepartments] = useState([]);
  const [departmentRoles, setDepartmentRoles] = useState({});

  const allRoles = ['receptionist', 'nurse', 'doctor', 'admin', 'superadmin'];

  // Authentication Methods
  const login = async formData => {
    setIsLoading(true);
    try {
      const res = await loginUser(formData);
      setCurrentUser(res.data.data.safeUser);
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const res = await getCurrentUser();
      setCurrentUser(res.data.data.safeUser || res.data.data);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUserInfo = async (formData, idPhoto) => {
    setIsLoading(true);
    try {
      const res = await verifyUser(formData, idPhoto);
      setCurrentUser(prev => ({ ...prev, faceEnrollmentStatus: 'completed' }));
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeVerification = async imageBlob => {
    try {
      const user = await verifyUserFaceRecog(imageBlob);
      setCurrentUser(user.data.data);
      return user;
    } catch (error) {
      console.log('Error in completeVerification:', error);
      throw error;
    }
  };

  const updateUserInfo = async (userId, updatedData) => {
    try {
      const updatedUser = await updateUser(userId, updatedData);
      setCurrentUser(updatedUser.data.data);
      return updatedUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // User Management Methods
  const fetchUsers = useCallback(async () => {
    setError(null);
    try {
      const filters = {};
      if (selectedRole !== 'all') {
        filters.role = selectedRole;
      }

      const res = await getAllUsers(
        filters,
        searchQuery,
        currentPage,
        itemsPerPage
      );

      if (res?.success) {
        setUsers(res.data.data || []);
        setTotalUsers(res.pagination?.total || 0);
      } else {
        setUsers(res?.data || res || []);
        setTotalUsers(res?.total || res?.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    }
  }, [selectedRole, searchQuery, currentPage, itemsPerPage]);

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await getStaffStatistics();

      if (res?.success) {
        setUserStatistics(res.data);
      } else {
        setUserStatistics(res?.data || res);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await getAllDepartments();
      console.log(res);

      if (res?.success) {
        setDepartments(res.data || []);
      } else {
        setDepartments(res?.data || res || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error.response?.data?.message || 'Failed to fetch departments');
      setDepartments([]);
    }
  }, []);

  // Fetch roles for a specific department
  const fetchDepartmentRoles = useCallback(async departmentId => {
    try {
      const res = await getRolesByDepartment(departmentId);

      return res?.data?.allowedRoles || res?.allowedRoles || [];
    } catch (error) {
      console.error('Error fetching department roles:', error);
      return [];
    }
  }, []);

  // Create new user
  const createNewUser = async userData => {
    setError(null);
    try {
      const res = await createUser(userData);

      await fetchUsers();
      await fetchStatistics();

      return {
        success: true,
        message:
          res?.data?.message || res?.message || 'User created successfully',
        data: res?.data || res,
      };
    } catch (error) {
      console.log();
      throw error;
    }
  };

  // Update existing user
  const updateExistingUser = async (userId, userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await updateStaffUser(userId, userData);
      await fetchUsers();
      await fetchStatistics();

      return {
        success: true,
        message:
          res?.data?.message || res?.message || 'User updated successfully',
        data: res?.data || res,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.message || 'Failed to update user';
      setError(errorMessage);
      throw new Error(errorMessage); // ✅ always error.message
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const deleteExistingUser = async userId => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deleteUser(userId);

      console.log('Delete User Response:', res);

      await fetchUsers();
      await fetchStatistics();

      return {
        success: true,
        message:
          res?.data?.message || res?.message || 'User deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle user status
  const toggleStatus = async userId => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await toggleUserStatus(userId);

      console.log('Toggle Status Response:', res);

      await fetchUsers();
      await fetchStatistics();

      return {
        success: true,
        message:
          res?.data?.message ||
          res?.message ||
          'User status updated successfully',
      };
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to toggle user status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get single user by ID
  // const fetchUserById = async userId => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const res = await getUserById(userId);

  //     console.log('Fetch User By ID Response:', res);

  //     if (res?.success) {
  //       return res.data;
  //     }
  //     return res?.data || res;
  //   } catch (error) {
  //     console.error('Error fetching user by ID:', error);
  //     setError(error.response?.data?.message || 'Failed to fetch user');
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const resetPassword = async userId => {
    setIsLoading(true);
    try {
      const res = await resetUserPassword(userId);
      return {
        success: true,
        message: res.data.message || 'Password reset successfully',
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Modal Management Methods
  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  // Fetch users when filters change
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setIsLoading(true);
      try {
        fetchUsers();
        fetchDepartments();
        fetchStatistics();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [
    selectedRole,
    searchQuery,
    currentPage,
    fetchUsers,
    fetchDepartments,
    fetchStatistics,
  ]);

  // Check authentication on mount
  useEffect(() => {
    const checkedLoggedIn = async () => {
      try {
        const res = await getCurrentUser();
        setCurrentUser(res.data.data.safeUser || res.data.data);
      } catch (error) {
        setCurrentUser(null);
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkedLoggedIn();
  }, []);

  const value = {
    // Auth state and methods
    currentUser,
    isLoading,
    login,
    logout,
    refreshUser,
    verifyUserInfo,
    completeVerification,
    updateUserInfo,

    // User Management state and methods
    users,
    userStatistics,
    modalMode,
    selectedUser,
    selectedRole,
    searchQuery,
    currentPage,
    totalUsers,
    itemsPerPage,
    departments,
    departmentRoles,
    allRoles,
    setSelectedRole,
    setSearchQuery,
    setCurrentPage,
    fetchUsers,
    fetchDepartments,
    fetchStatistics,
    createNewUser,
    updateExistingUser,
    deleteExistingUser,
    toggleStatus,
    resetPassword,
    fetchDepartmentRoles,
    openModal,
    closeModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;
