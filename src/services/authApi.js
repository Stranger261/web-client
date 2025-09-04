import axios from 'axios';

const AFRS_BASE_URL = 'http://localhost:8010/api';
const AUTH_SERVICE_BASE_URL = 'http://localhost:8000';

export const postImageForOcr = async file => {
  const fd = new FormData();
  fd.append('image', file);

  try {
    const { data } = await axios.post(`${AFRS_BASE_URL}/ocr`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'OCR server error');
  }
};

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
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const verifyOtp = async (otp, userId) => {
  console.log(otp, userId);
  const res = await axios.post(`${AUTH_SERVICE_BASE_URL}/verify-otp`, {
    userId,
    otp,
  });

  return res;
};

export const verifyUser = async userId => {
  const res = await axios.post(`${AUTH_SERVICE_BASE_URL}/verify-user`, {
    userId,
  });

  return res;
};

// export const verifyUser = async (payload, imageFile) => {
//   const fd = new FormData();

//   // Add all form fields
//   Object.entries(payload).forEach(([key, value]) => fd.append(key, value));

//   // Add the image file
//   if (imageFile) fd.append('imageFile', imageFile);

//   try {
//     const { data } = await axios.post(`${AUTH_SERVICE_BASE_URL}/register`, fd, {
//       headers: {
//         'Content-Type': 'multipart/form-data', //
//       },
//     });
//     return data;
//   } catch (error) {
//     console.log(error);
//     throw new Error(error.response?.data?.error || 'Registration failed');
//   }
// };
