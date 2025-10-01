import axios from 'axios';
import { AUTH_SERVICE_BASE_URL } from '../config/API_URL';

// Get all users/staff with pagination and filters
export const getAllUsers = async (
  filters = {},
  search = '',
  page = 1,
  limit = 10
) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(filters.role && { role: filters.role }),
      ...(filters.department && { department: filters.department }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    });

    const res = await axios.get(
      `${AUTH_SERVICE_BASE_URL}/staff?${params.toString()}`,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data?.error || 'Failed to fetch users';
  }
};

// Create new staff user
export const createUser = async userData => {
  try {
    const res = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/staff/create`,
      userData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res;
  } catch (error) {
    if (error.response.data.message.includes('duplicate')) {
      throw 'Email already used.';
    } else {
      throw error.response?.data?.error || 'Failed to create user';
    }
  }
};

// Update staff user
export const updateStaffUser = async (userId, userData) => {
  try {
    const res = await axios.put(
      `${AUTH_SERVICE_BASE_URL}/staff/${userId}`,
      userData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res;
  } catch (error) {
    console.error('Error updating user:', error);
    const msg = error.response?.data?.message || 'Failed to update user';
    throw new Error(msg); // ✅ always throw an Error object
  }
};

// Delete staff user (soft delete)
export const deleteUser = async userId => {
  try {
    const res = await axios.delete(`${AUTH_SERVICE_BASE_URL}/staff/${userId}`, {
      withCredentials: true,
    });
    return res;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error.response?.data?.error || 'Failed to delete user';
  }
};

// Toggle user status (Active/Inactive)
export const toggleUserStatus = async userId => {
  try {
    const res = await axios.patch(
      `${AUTH_SERVICE_BASE_URL}/staff/${userId}/toggle-status`,
      {},
      {
        withCredentials: true,
      }
    );
    return res;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error.response?.data?.error || 'Failed to toggle user status';
  }
};

// Reset staff user password
export const resetUserPassword = async userId => {
  try {
    const res = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/staff/${userId}/reset-password`,
      {},
      {
        withCredentials: true,
      }
    );
    return res;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error.response?.data?.error || 'Failed to reset password';
  }
};

// Get staff user by ID
// export const getUserById = async userId => {
//   try {
//     const res = await axios.get(`${AUTH_SERVICE_BASE_URL}/staff/${userId}`, {
//       withCredentials: true,
//     });
//     return res;
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     throw error.response?.data?.error || 'Failed to fetch user';
//   }
// };

// Get all departments from appointment service
export const getAllDepartments = async () => {
  try {
    const res = await axios.get(`${AUTH_SERVICE_BASE_URL}/staff/departments`, {
      withCredentials: true,
    });
    return res.data.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error.response?.data?.error || 'Failed to fetch departments';
  }
};

// Get roles by department
export const getRolesByDepartment = async departmentId => {
  try {
    const res = await axios.get(
      `${AUTH_SERVICE_BASE_URL}/staff/departments/${departmentId}/roles`,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching roles by department:', error);
    throw error.response?.data?.error || 'Failed to fetch roles';
  }
};

// Get staff statistics
export const getStaffStatistics = async () => {
  try {
    const res = await axios.get(`${AUTH_SERVICE_BASE_URL}/staff/stats`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error.response?.data?.error || 'Failed to fetch statistics';
  }
};

// Get users by role
export const getUsersByRole = async role => {
  try {
    const res = await axios.get(`${AUTH_SERVICE_BASE_URL}/staff/role/${role}`, {
      withCredentials: true,
    });
    console.log(res);
    return res;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error.response?.data?.error || 'Failed to fetch users by role';
  }
};

// Get users by department
export const getUsersByDepartment = async department => {
  try {
    const res = await axios.get(
      `${AUTH_SERVICE_BASE_URL}/staff/department/${department}`,
      {
        withCredentials: true,
      }
    );
    console.log(res);
    return res;
  } catch (error) {
    console.error('Error fetching users by department:', error);
    throw error.response?.data?.error || 'Failed to fetch users by department';
  }
};
