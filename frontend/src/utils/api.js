import axios from 'axios';

// Base URI configuration
const baseURI = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: baseURI,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to attach token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Unified API handler
const request = async (endpoint, method = 'GET', data = null) => {
    try {
        const config = {
            method,
            url: endpoint,
            ...(data && { data })
        };
        const response = await api(config);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Something went wrong';
        throw new Error(errorMessage);
    }
};

// API methods grouped by functionality

// Authentication API Methods
export const authAPI = {
    login: (credentials) => request('/users/login', 'POST', credentials),
    register: (userData) => request('/users/register', 'POST', userData),
    getUserProfile: () => request('/users/profile'),
    getAllTeachers: () => request('/users/teachers'),
    getTeacherDashboard: () => request('/users/teachers/dashboard'),
    getPrincipalDashboard: () => request('/users/principal/dashboard'),
    getAllStudents: () => request('/users/students'),
    getAllAdmins: () => request('/users/admins'),
    getAllPrincipals: () => request('/users/principals'),
    getAdminData: () => request('/users/admin'),
    delete: (id) => request(`/users/${id}`)
};

// Timetable API Methods
export const timetableAPI = {
    create: (timetableData) => request('/timetables', 'POST', timetableData),
    getByClass: (classId) => request(`/timetables/class/${classId}`),
    getAllClasses: () => request('/timetables/class'),
    getByTeacher: (teacherId) => request(`/timetables/teacher/${teacherId}`),
    update: (id, updateData) => request(`/timetables/${id}`, 'PUT', updateData),
    delete: (id) => request(`/timetables/${id}`, 'DELETE'),
};

// Subject API Methods
export const subjectAPI = {
    create: (subjectData) => request('/subjects', 'POST', subjectData),
    getAll: () => request('/subjects'),
    getById: (id) => request(`/subjects/${id}`),
    update: (id, updateData) => request(`/subjects/${id}`, 'PUT', updateData),
    delete: (id) => request(`/subjects/${id}`, 'DELETE'),
    deleteMany: (deleteData) => request(`/subjects/delete/`, 'DELETE', deleteData)
};

// Class API Methods
export const classAPI = {
    create: (classData) => request('/classes', 'POST', classData),
    getAll: () => request('/classes'),
    getById: (id) => request(`/classes/${id}`),
    update: (id, updateData) => request(`/classes/${id}`, 'PUT', updateData),
    delete: (id) => request(`/classes/${id}`, 'DELETE')
};

export const create = {
    weeklySetup: (classId, weeklySetUpData) => request(`/timetables/weekly-setup/${classId}`, 'POST', weeklySetUpData),
    getBindings: (classId, onlyBindings) => request(`/timetables/bindings/${classId}${onlyBindings ? "?onlyBindings=true" : ""}`),
    saveDayTimetable: (classId, dayData) => request(`/timetables/daily/${classId}`, 'POST', dayData),
    getFullTimetable: (classId) => request(`/timetables/${classId}/full`),
    getDayTimetable: (classId, day) => request(`/timetables/${classId}/${day}`),
    delete: (id) => request(`/timetables/${id}`, 'DELETE')
};

export const contact = {
    create: (contactData) => request('/contacts', 'POST', contactData),
    getAll: () => request('/contacts'),
};

// Export the axios instance for direct use
export default api;
