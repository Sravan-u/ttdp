import axios from 'axios';

// Use environment variable or fallback to Render backend for production
const BASE_URL = process.env.REACT_APP_API_URL || 'https://ttdp-6.onrender.com/api';

const api = axios.create({ baseURL: BASE_URL });

// Interceptor for token if present (optional, won't fail if no auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const adminLogin = (data) => api.post('/auth/admin/login', data);

// Parking
export const getAllSlots = () => api.get('/parking');
export const getAvailableSlots = () => api.get('/parking/available');
export const bookSlot = (slotId) => api.post(`/parking/book/${slotId}`);
export const releaseSlot = (slotId) => api.post(`/parking/release/${slotId}`);
export const getMyBooking = () => api.get('/parking/my-booking');
export const getMyHistory = () => api.get('/parking/my-history');

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAllUsers = () => api.get('/admin/users');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAllSlotsAdmin = () => api.get('/admin/slots');
export const addSlot = (data) => api.post('/admin/slots', data);
export const updateSlot = (id, data) => api.put(`/admin/slots/${id}`, data);
export const deleteSlot = (id) => api.delete(`/admin/slots/${id}`);
export const getAllBookings = () => api.get('/admin/bookings');

export default api;