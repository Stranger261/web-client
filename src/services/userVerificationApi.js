import axios from 'axios';

import { AUTH_SERVICE_BASE_URL } from '../config/API_URL';

export const postImageForOcr = async file => {
  const fd = new FormData();
  fd.append('image', file);

  try {
    const { data } = await axios.post(`${AUTH_SERVICE_BASE_URL}/ocr`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'OCR server error');
  }
};
