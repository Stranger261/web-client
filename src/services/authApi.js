import axios from 'axios';
import {
  AUTH_SERVICE_BASE_URL,
  PATIENT_SERVICE_BASE_URL,
} from '../config/API_URL';

export const registerUser = async payload => {
  try {
    const { data } = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/register`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    throw error.response?.data?.error || 'Registration failed';
  }
};

export const verifyOtp = async (otp, userId) => {
  try {
    const res = await axios.post(`${AUTH_SERVICE_BASE_URL}/verify-otp`, {
      userId,
      otp,
    });

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const verifyUser = async (payload, imageFile) => {
  const fd = new FormData();

  // Add all form fields
  Object.entries(payload).forEach(([key, value]) => fd.append(key, value));

  // Add the image file
  if (imageFile) fd.append('idPhoto', imageFile);

  try {
    const { data } = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/verify-user-info`,
      fd,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    throw error?.response?.data?.message;
  }
};

export const verifyUserFaceRecog = async imageBlob => {
  const formData = new FormData();
  formData.append('image', imageBlob, 'live.jpg'); // backend expects "liveImage"

  const res = await axios.post(
    `${PATIENT_SERVICE_BASE_URL}/api/face/verify`,
    formData,
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );

  return res;
};

export const loginUser = async credentials => {
  try {
    const res = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/login`,
      credentials,
      { withCredentials: true }
    );

    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const logoutUser = async () => {
  await axios.post(
    `${AUTH_SERVICE_BASE_URL}/logout`,
    {},
    {
      withCredentials: true,
    }
  );
};

export const getCurrentUser = async () => {
  const res = axios.get(`${AUTH_SERVICE_BASE_URL}/user/me`, {
    withCredentials: true,
  });

  return res;
};

export const updateUser = async (userId, updatedData) => {
  const res = await axios.put(
    `${AUTH_SERVICE_BASE_URL}/update-user/${userId}`,
    updatedData,
    {
      withCredentials: true,
    }
  );

  return res;
};
