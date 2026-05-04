import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.7:5000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

// Trips
export const createTrip = (data: object) => api.post('/trips', data);
export const getTrips = (userId: string) => api.get(`/trips?userId=${userId}`);
export const updateTrip = (id: string, data: object) => api.put(`/trips/${id}`, data);
export const deleteTrip = (id: string) => api.delete(`/trips/${id}`);

// Expenses
export const addExpense = (data: object) => api.post('/expenses', data);
export const getTripExpenses = (tripId: string) => api.get(`/expenses/trip/${tripId}`);
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`);
