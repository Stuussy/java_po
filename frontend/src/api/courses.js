import axios from './axios';

export const coursesAPI = {
  getAllCourses: async () => {
    const response = await axios.get('/courses');
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await axios.get(`/courses/${id}`);
    return response.data;
  },

  searchCourses: async (query) => {
    const response = await axios.get(`/courses/search?query=${query}`);
    return response.data;
  },

  getCourseProgress: async (courseId) => {
    const response = await axios.get(`/courses/${courseId}/progress`);
    return response.data;
  },

  completeModule: async (courseId, moduleId) => {
    const response = await axios.post(`/courses/${courseId}/modules/${moduleId}/complete`);
    return response.data;
  },

  getMyProgress: async () => {
    const response = await axios.get('/courses/my-progress');
    return response.data;
  },

  getMyCompleted: async () => {
    const response = await axios.get('/courses/my-completed');
    return response.data;
  },
};
