import axios from 'axios';

import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class authService {
  constructor() {
    this.authApi = axios.create({
      baseURL: DEVELOPMENT_BASE_URL,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });

    this.authApi.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.data?.code === 'INACTIVITY_TIMEOUT') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  async login(email, password, rememberMe) {
    try {
      const res = await this.authApi.post('/auth/login', {
        email,
        password,
        rememberMe,
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async autoLogin() {
    try {
      const res = await this.authApi.post('/auth/auto-login');

      return res.data;
    } catch (error) {
      console.error('login failed: ', error);
      throw error;
    }
  }

  async verifyAndLogin({
    email,
    otpCode,
    trustDevice,
    rememberMe,
    deviceFingerprint,
  }) {
    try {
      const res = await this.authApi.post('/auth/verify-otp', {
        email,
        otpCode,
        trustDevice,
        rememberMe,
        deviceFingerprint,
      });
      return res.data;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  }

  async resendOtpLogin(email, ipAddress) {
    try {
      const res = await this.authApi.post('/auth/resendOTP', {
        email,
        ipAddress,
      });

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  // 2FA Management
  async enable2FA(method = 'email') {
    try {
      const res = await this.authApi.post('/auth/2fa/enable', { method });
      return res.data;
    } catch (error) {
      console.error('Enable 2FA failed:', error);
      throw error;
    }
  }

  async disable2FA() {
    try {
      const res = await this.authApi.post('/auth/2fa/disable');
      return res.data;
    } catch (error) {
      console.error('Disable 2FA failed:', error);
      throw error;
    }
  }

  async get2FAStatus() {
    try {
      const res = await this.authApi.get('/auth/2fa/status');
      return res.data;
    } catch (error) {
      console.error('Get 2FA status failed:', error);
      throw error;
    }
  }

  async getTrustedDevices() {
    try {
      const res = await this.authApi.get('/auth/2fa/trusted-devices');
      return res.data;
    } catch (error) {
      console.error('Get trusted devices failed:', error);
      throw error;
    }
  }

  async revokeTrustedDevice(deviceId) {
    try {
      const res = await this.authApi.delete(
        `/auth/2fa/trusted-devices/${deviceId}`,
      );
      return res.data;
    } catch (error) {
      console.error('Revoke trusted device failed:', error);
      throw error;
    }
  }

  async register(email, phone, password) {
    try {
      const res = await this.authApi.post(
        '/registration/initial-registration',
        { email, phone, password },
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async logout() {
    try {
      const res = await this.authApi.post('/auth/logout');
      return res.data;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const currentUser = await this.authApi.get('/auth/user-profile');

      return currentUser.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async resendOtp() {
    try {
      const res = await this.authApi.post('/registration/resend-otp');

      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyOtp(token) {
    try {
      const res = await this.authApi.post('/registration/verify-email', {
        token,
      });

      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async completePersonalInfo(personData) {
    const formDataToSend = new FormData();

    const { id_image, ...otherData } = personData;

    Object.keys(otherData).forEach(key => {
      if (otherData[key] !== null && otherData[key] !== undefined) {
        formDataToSend.append(key, otherData[key]);
      }
    });

    if (id_image instanceof File) {
      formDataToSend.append('id_photo', id_image);
    }
    console.log(formDataToSend);

    try {
      const res = await this.authApi.post(
        '/registration/complete-profile',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      console.log(res);

      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyFace(faceData) {
    try {
      const res = await this.authApi.post(
        '/registration/complete-face-verification',
        faceData,
      );
      console.log(res);

      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new authService();
