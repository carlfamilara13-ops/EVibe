import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

let cachedData: any = null;
let cacheTime = 0;
let cachedTripId: string | null = null;
const CACHE_DURATION = 10000; // 10 seconds

export const useCarbonData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carbonData, setCarbonData] = useState<any>(null);

  useEffect(() => {
    loadCarbonData();
  }, []);

  const loadCarbonData = async () => {
    const now = Date.now();
    
    try {
      const tripStr = await AsyncStorage.getItem('activeTrip');
      
      if (!tripStr) {
        setError('No active trip found. Please start a trip from the setup screen.');
        setLoading(false);
        return;
      }

      const trip = JSON.parse(tripStr);
      const currentTripId = trip._id;
      
      // Use cache only if same trip and not expired
      if (cachedData && cachedTripId === currentTripId && now - cacheTime < CACHE_DURATION) {
        setCarbonData(cachedData);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      const url = `${BASE_URL}/trips/${currentTripId}/carbon`;

      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.hasData) {
        cachedData = response.data;
        cacheTime = now;
        cachedTripId = currentTripId;
        setCarbonData(response.data);
      } else {
        setError('No carbon data available. Please recalculate your trip route.');
      }
    } catch (err: any) {
      console.error('Carbon data error:', err?.response?.data || err?.message || err);
      setError(err?.response?.data?.error || 'Failed to load carbon data');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, carbonData, refetch: loadCarbonData };
};
