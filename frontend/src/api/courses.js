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
};
