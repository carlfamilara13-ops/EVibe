import axios from 'axios';
import { getRoute } from '@/services/ors';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const apiClient = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL! });

export type CommuteResult = {
  type: 'train' | 'road' | 'mixed';
  suggestions: CommuteSuggestion[];
  totalDistanceKm: number;
};
export type CommuteSuggestion = {
  type: 'train' | 'bus';
  line: string;
  label: string;
  steps: CommuteStep[];
  totalDuration: number;
  totalFare: number;
  color: string;
};
export type CommuteStep = {
  type: 'walk' | 'train' | 'bus';
  label: string;
  detail: string;
  duration: number;
  fare: number;
  color: string;
  coordinates?: { latitude: number; longitude: number }[];
};

export const getCommuteRoute = async (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): Promise<CommuteResult> => {
  if (USE_MOCK) {
    const road = await getRoute(from, to, 'driving-car');
    const dist = parseFloat(road.distanceKm);
    return {
      type: 'mixed',
      totalDistanceKm: dist,
      suggestions: [
        {
          type: 'train', line: 'MRT-3', label: 'MRT Line 3', color: '#FF6B35',
          totalDuration: Math.round(dist * 3), totalFare: Math.round(dist * 2 + 15),
          steps: [
            { type: 'walk', label: 'Walk to MRT Station', detail: '~500m · 6 min', duration: 6, fare: 0, color: '#00E676', coordinates: road.coordinates.slice(0, 5) },
            { type: 'train', label: 'MRT-3 Northbound', detail: `4 stops · ~18 min · ₱${Math.round(dist * 2 + 15)}`, duration: 18, fare: Math.round(dist * 2 + 15), color: '#FF6B35', coordinates: road.coordinates },
            { type: 'walk', label: 'Walk to destination', detail: '~300m · 4 min', duration: 4, fare: 0, color: '#00E676', coordinates: road.coordinates.slice(-5) },
          ],
        },
        {
          type: 'bus', line: 'BUS', label: 'Bus / Jeepney', color: '#40C4FF',
          totalDuration: road.durationMin + 10, totalFare: Math.round(dist * 1.5 + 13),
          steps: [
            { type: 'walk', label: 'Walk to bus stop', detail: '~200m · 3 min', duration: 3, fare: 0, color: '#00E676' },
            { type: 'bus', label: 'Take bus/jeepney along route', detail: `${road.distanceKm} km · ~${road.durationMin} min · ₱${Math.round(dist * 1.5 + 13)}`, duration: road.durationMin, fare: Math.round(dist * 1.5 + 13), color: '#40C4FF', coordinates: road.coordinates },
            { type: 'walk', label: 'Walk to destination', detail: '~150m · 2 min', duration: 2, fare: 0, color: '#00E676' },
          ],
        },
      ],
    };
  }

  // Real API
  try {
    const res = await apiClient.get('/gtfs/commute', {
      params: { fromLat: from.latitude, fromLon: from.longitude, toLat: to.latitude, toLon: to.longitude },
    });
    // ... real implementation handled by co-dev's backend
    return res.data;
  } catch {
    return { type: 'road', suggestions: [], totalDistanceKm: 0 };
  }
};
