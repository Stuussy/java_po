import axios from './axios';

export const testsAPI = {
  getAllTests: async () => {
    const response = await axios.get('/tests');
    return response.data;
  },

  getTestById: async (id) => {
    const response = await axios.get(`/tests/${id}`);
    return response.data;
  },

  searchTests: async (query) => {
    const response = await axios.get(`/tests/search?query=${query}`);
    return response.data;
  },

  startTest: async (testId) => {
    const response = await axios.post(`/tests/${testId}/start`);
    return response.data;
  },

  saveAnswer: async (testId, attemptId, answer) => {
    const response = await axios.post(`/tests/${testId}/attempt/${attemptId}/answer`, answer);
    return response.data;
  },

  submitTest: async (testId, attemptId) => {
    const response = await axios.post(`/tests/${testId}/attempt/${attemptId}/submit`);
    return response.data;
  },

  getAttempt: async (attemptId) => {
    const response = await axios.get(`/tests/attempt/${attemptId}`);
    return response.data;
  },

  getMyAttempts: async () => {
    const response = await axios.get('/tests/my-attempts');
    return response.data;
  },
};
