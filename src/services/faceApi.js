import axios from 'axios';
import { AUTH_SERVICE_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class faceService {
  constructor() {
    this.faceApi = axios.create({
      baseURL: AUTH_SERVICE_BASE_URL,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
  }

  async postImageForOcr(file) {
    const fd = new FormData();
    fd.append('image', file);

    try {
      const { data } = await this.faceApi.post('/registration/ocr', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'OCR server error');
    }
  }
}

export default new faceService();
