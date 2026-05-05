import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

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
export const calculateTripCarbon = (tripId: string, distance: number, mode: string) =>
  api.post(`/trips/${tripId}/carbon`, { distance, mode });
export const getTripCarbon = (tripId: string) => api.get(`/trips/${tripId}/carbon`);

// Expenses
export const addExpense = (data: object) => api.post('/expenses', data);
export const getTripExpenses = (tripId: string) => api.get(`/expenses/trip/${tripId}`);
export const getUserExpenses = (userId: string, month?: number, year?: number) =>
  api.get('/expenses/user', { params: { userId, month, year } });
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`);

// Incomes
export const addIncome = (data: object) => api.post('/incomes', data);
export const getIncomes = (userId: string, month?: number, year?: number) =>
  api.get('/incomes', { params: { userId, month, year } });
export const deleteIncome = (id: string) => api.delete(`/incomes/${id}`);
export const getDailySummary = (userId: string, date: string) =>
  api.get('/incomes/summary/daily', { params: { userId, date } });
export const getMonthlySummary = (userId: string, month: number, year: number) =>
  api.get('/incomes/summary/monthly', { params: { userId, month, year } });
export const getYearlySummary = (userId: string, year: number) =>
  api.get('/incomes/summary/yearly', { params: { userId, year } });
