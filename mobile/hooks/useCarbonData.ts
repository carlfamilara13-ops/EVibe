import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export const useCarbonData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carbonData, setCarbonData] = useState<any>(null);

  useEffect(() => {
    loadCarbonData();
  }, []);

  const loadCarbonData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const tripStr = await AsyncStorage.getItem('activeTrip');
      console.log('Active trip from storage:', tripStr);
      
      if (!tripStr) {
        setError('No active trip found. Please start a trip from the setup screen.');
        setLoading(false);
        return;
      }

      const trip = JSON.parse(tripStr);
      console.log('Trip ID:', trip._id);
      
      const token = await AsyncStorage.getItem('token');
      const url = `${BASE_URL}/trips/${trip._id}/carbon`;
      console.log('Fetching carbon data from:', url);

      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log('Carbon data response:', response.data);

      if (response.data.hasData) {
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
