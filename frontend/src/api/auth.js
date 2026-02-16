import axios from './axios';

export const authAPI = {
  register: async (data) => {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await axios.post('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  updateAvatar: async (avatar) => {
    const response = await axios.put('/auth/update-avatar', { avatar });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  },

  validateResetToken: async (token) => {
    const response = await axios.post('/auth/validate-reset-token', { token });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await axios.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};
