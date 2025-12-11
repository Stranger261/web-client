import axios from 'axios';

import { AUTH_SERVICE_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class authService {
  constructor() {
    this.authApi = axios.create({
      baseURL: AUTH_SERVICE_BASE_URL,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
  }

  async login(email, password) {
    try {
      const res = await this.authApi.post('/auth/login', {
        email,
        password,
      });
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async register(email, phone, password) {
    try {
      const res = await this.authApi.post(
        '/registration/initial-registration',
        { email, phone, password }
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async logout() {
    const response = await this.authApi.post('/auth/logout');
    return response;
  }

  async getCurrentUser() {
    try {
      const currentUser = await this.authApi.get('/auth/user-profile');

      return currentUser.data;
    } catch (error) {
      console.log(error);
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
        { headers: { 'Content-Type': 'multipart/form-data' } }
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
        faceData
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
