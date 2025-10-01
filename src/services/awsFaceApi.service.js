// services/awsFaceApi.service.js
import axios from 'axios';

// Get base URL from environment or use default
const getBaseURL = () => {
  return 'http://localhost:8001';
};

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds for face processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * AWS Face Recognition API Service
 */
export const awsFaceApiService = {
  /**
   * Check AWS services health
   */
  async checkHealth() {
    try {
      const response = await apiClient.get('/api/face/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('AWS health check failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Health check failed',
      };
    }
  },

  /**
   * Enroll user's face
   */
  async enrollFace(imageFile, source = 'manual_upload') {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('source', source);

      const response = await apiClient.post('/api/face/enroll', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('AWS face enrollment failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Face enrollment failed',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Verify face against enrolled face
   */
  async verifyFace(liveImageFile) {
    try {
      const formData = new FormData();
      formData.append('image', liveImageFile);

      const response = await apiClient.post('/api/face/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('AWS face verification failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Face verification failed',
        statusCode: error.response?.status,
        details: error.response?.data,
      };
    }
  },

  /**
   * Get user's face profile
   */
  async getFaceProfile() {
    try {
      const response = await apiClient.get('/api/face/profile');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get face profile failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get face profile',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Delete user's face profile
   */
  async deleteFaceProfile() {
    try {
      const response = await apiClient.delete('/api/face/profile');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Delete face profile failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete face profile',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Check enrollment status
   */
  async checkEnrollmentStatus() {
    try {
      const response = await apiClient.get('/api/face/enrollment-status');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Check enrollment status failed:', error);
      return {
        success: false,
        error:
          error.response?.data?.message || 'Failed to check enrollment status',
        statusCode: error.response?.status,
      };
    }
  },
};

// Export individual functions for easier imports
export const {
  checkHealth,
  enrollFace,
  verifyFace,
  getFaceProfile,
  deleteFaceProfile,
  checkEnrollmentStatus,
} = awsFaceApiService;

export default awsFaceApiService;
