import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// ─── REAL API ────────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL! });
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));
const ok = (data: any) => Promise.resolve({ data });
const mockUser = { id: 'mock-user-1', name: 'Demo User', email: 'test@test.com' };
const mockToken = 'mock-token-123';
const mockExpenses = [
  { _id: 'e1', category: 'charging', amount: 250, description: 'SM North EVCS', date: new Date().toISOString() },
  { _id: 'e2', category: 'other', amount: 1500, description: 'Tire rotation', date: new Date().toISOString() },
  { _id: 'e3', category: 'other', amount: 3000, description: 'Monthly premium', date: new Date().toISOString() },
];
const mockIncomes = [
  { _id: 'i1', category: 'salary', amount: 45000, description: 'Monthly salary', date: new Date().toISOString() },
  { _id: 'i2', category: 'other', amount: 8000, description: 'Design project', date: new Date().toISOString() },
];
const mockTrips = [
  {
    _id: 't1', origin: 'Home', destination: 'Office',
    distanceKm: 12.5, mode: 'commute', date: new Date().toISOString(), carbonKg: 1.8, durationMin: 45,
    steps: [
      { type: 'walk', label: 'Walk to jeepney stop', place: 'Rizal St corner Mabini', distanceKm: 0.3, durationMin: 4, cost: 0, co2Kg: 0, icon: 'walk' },
      { type: 'jeepney', label: 'Jeepney', place: 'Cubao → Ortigas', distanceKm: 5.2, durationMin: 18, cost: 13, co2Kg: 0.6, icon: 'bus' },
      { type: 'walk', label: 'Walk to MRT station', place: 'Shaw Blvd Station', distanceKm: 0.2, durationMin: 3, cost: 0, co2Kg: 0, icon: 'walk' },
      { type: 'train', label: 'MRT-3', place: 'Shaw Blvd → Ayala', distanceKm: 4.8, durationMin: 12, cost: 28, co2Kg: 0.4, icon: 'train' },
      { type: 'walk', label: 'Walk to office', place: 'Ayala Ave, Makati', distanceKm: 0.5, durationMin: 7, cost: 0, co2Kg: 0, icon: 'walk' },
      { type: 'purchase', label: 'Bought breakfast', place: '7-Eleven near office', distanceKm: 0, durationMin: 5, cost: 85, co2Kg: 0, icon: 'bag-handle' },
    ],
  },
  {
    _id: 't2', origin: 'Office', destination: 'Mall',
    distanceKm: 5.2, mode: 'commute', date: new Date(Date.now() - 86400000).toISOString(), carbonKg: 0.8, durationMin: 28,
    steps: [
      { type: 'walk', label: 'Walk to tricycle', place: 'Paseo de Roxas', distanceKm: 0.1, durationMin: 2, cost: 0, co2Kg: 0, icon: 'walk' },
      { type: 'tricycle', label: 'Tricycle', place: 'Makati CBD → Glorietta', distanceKm: 2.1, durationMin: 10, cost: 30, co2Kg: 0.5, icon: 'bicycle' },
      { type: 'walk', label: 'Walk inside mall', place: 'SM Makati entrance', distanceKm: 0.3, durationMin: 5, cost: 0, co2Kg: 0, icon: 'walk' },
      { type: 'purchase', label: 'Lunch at food court', place: 'Jollibee, SM Makati', distanceKm: 0, durationMin: 20, cost: 145, co2Kg: 0, icon: 'restaurant' },
    ],
  },
];

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const register = async (name: string, email: string, password: string) => {
  if (USE_MOCK) { await delay(); return ok({ token: mockToken, user: { ...mockUser, name, email } }); }
  return api.post('/auth/register', { name, email, password });
};
export const login = async (email: string, password: string) => {
  if (USE_MOCK) { await delay(); return ok({ token: mockToken, user: mockUser }); }
  return api.post('/auth/login', { email, password });
};

// ─── TRIPS ────────────────────────────────────────────────────────────────────
export const createTrip = async (data: object) => {
  if (USE_MOCK) { await delay(); return ok({ ...mockTrips[0], ...data, _id: 't' + Date.now() }); }
  return api.post('/trips', data);
};
export const getTrips = async (userId: string) => {
  if (USE_MOCK) { await delay(); return ok(mockTrips); }
  return api.get(`/trips?userId=${userId}`);
};
export const updateTrip = async (id: string, data: object) => {
  if (USE_MOCK) { await delay(); return ok({ _id: id, ...data }); }
  return api.put(`/trips/${id}`, data);
};
export const deleteTrip = async (id: string) => {
  if (USE_MOCK) { await delay(); return ok({ success: true }); }
  return api.delete(`/trips/${id}`);
};
export const calculateTripCarbon = async (tripId: string, distance: number, mode: string) => {
  if (USE_MOCK) { await delay(); return ok({ carbonKg: distance * 0.06 }); }
  return api.post(`/trips/${tripId}/carbon`, { distance, mode });
};
export const getTripCarbon = async (tripId: string) => {
  if (USE_MOCK) { await delay(); return ok({ carbonKg: 1.2, savedKg: 3.5 }); }
  return api.get(`/trips/${tripId}/carbon`);
};

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
export const addExpense = async (data: object) => {
  if (USE_MOCK) { await delay(); return ok({ _id: 'e' + Date.now(), ...data }); }
  return api.post('/expenses', data);
};
export const getTripExpenses = async (tripId: string) => {
  if (USE_MOCK) { await delay(); return ok(mockExpenses); }
  return api.get(`/expenses/trip/${tripId}`);
};
export const getUserExpenses = async (userId: string, month?: number, year?: number) => {
  if (USE_MOCK) { await delay(); return ok(mockExpenses); }
  return api.get('/expenses/user', { params: { userId, month, year } });
};
export const deleteExpense = async (id: string) => {
  if (USE_MOCK) { await delay(); return ok({ success: true }); }
  return api.delete(`/expenses/${id}`);
};

// ─── INCOMES ──────────────────────────────────────────────────────────────────
export const addIncome = async (data: object) => {
  if (USE_MOCK) { await delay(); return ok({ _id: 'i' + Date.now(), ...data }); }
  return api.post('/incomes', data);
};
export const getIncomes = async (userId: string, month?: number, year?: number) => {
  if (USE_MOCK) { await delay(); return ok(mockIncomes); }
  return api.get('/incomes', { params: { userId, month, year } });
};
export const deleteIncome = async (id: string) => {
  if (USE_MOCK) { await delay(); return ok({ success: true }); }
  return api.delete(`/incomes/${id}`);
};
export const getDailySummary = async (userId: string, date: string) => {
  if (USE_MOCK) { await delay(); return ok({ date, totalIncome: 1500, totalExpenses: 400, balance: 1100, incomes: [], expenses: [] }); }
  return api.get('/incomes/summary/daily', { params: { userId, date } });
};
export const getMonthlySummary = async (userId: string, month: number, year: number) => {
  if (USE_MOCK) { await delay(); return ok({ month, year, totalIncome: 53000, totalExpenses: 4750, balance: 48250, incomeChange: '5.2', expenseChange: '-2.1', dailyMap: {} }); }
  return api.get('/incomes/summary/monthly', { params: { userId, month, year } });
};
export const getYearlySummary = async (userId: string, year: number) => {
  if (USE_MOCK) {
    await delay();
    return ok({ year, totalIncome: 636000, totalExpenses: 57000, balance: 579000, monthly: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 53000, expenses: 4750, balance: 48250 })) });
  }
  return api.get('/incomes/summary/yearly', { params: { userId, year } });
};
