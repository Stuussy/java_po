import axios from './axios';

export const adminAPI = {
  
  getAllTests: async () => {
    const response = await axios.get('/admin/tests');
    return response.data;
  },

  createTest: async (test) => {
    const response = await axios.post('/admin/tests', test);
    return response.data;
  },

  updateTest: async (id, test) => {
    const response = await axios.put(`/admin/tests/${id}`, test);
    return response.data;
  },

  deleteTest: async (id) => {
    await axios.delete(`/admin/tests/${id}`);
  },

  
  getAllUsers: async () => {
    const response = await axios.get('/admin/users');
    return response.data;
  },

  deleteUser: async (id) => {
    await axios.delete(`/admin/users/${id}`);
  },

  updateUserRole: async (id, role) => {
    const response = await axios.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  
  getTestReport: async (testId) => {
    const response = await axios.get(`/admin/reports/test/${testId}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axios.get('/admin/reports/dashboard');
    return response.data;
  },
};
