import { getRoute } from '@/services/ors';
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
const apiClient = axios.create({ baseURL: BASE_URL });

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
  try {
    const res = await apiClient.get('/gtfs/commute', {
      params: {
        fromLat: from.latitude,
        fromLon: from.longitude,
        toLat: to.latitude,
        toLon: to.longitude,
      },
    });

    const data = res.data;
    const suggestions: CommuteSuggestion[] = [];

    for (const option of data.suggestions) {
      const steps: CommuteStep[] = [];
      let totalDuration = 0;
      let totalFare = 0;

      if (option.type === 'train' || option.type === 'bus') {
        // Walk to station
        if (option.walkToStop > 0.05) {
          try {
            const walk = await getRoute(
              from,
              { latitude: option.fromStop.lat, longitude: option.fromStop.lon },
              'foot-walking'
            );
            steps.push({
              type: 'walk',
              label: `Walk to ${option.fromStop.name}`,
              detail: `${walk.distanceKm} km · ${walk.durationMin} min`,
              duration: walk.durationMin,
              fare: 0,
              color: '#00E676',
              coordinates: walk.coordinates,
            });
            totalDuration += walk.durationMin;
          } catch {
            const walkMin = Math.round(option.walkToStop * 12);
            steps.push({
              type: 'walk',
              label: `Walk to ${option.fromStop.name}`,
              detail: `~${(option.walkToStop * 1000).toFixed(0)}m · ${walkMin} min`,
              duration: walkMin,
              fare: 0,
              color: '#00E676',
            });
            totalDuration += walkMin;
          }
        }

        // Train/Bus ride with shape coordinates
        const stepColor = option.type === 'train' ? `#${option.color}` : '#40C4FF';
        const stepType = option.type === 'train' ? 'train' : 'bus';
        steps.push({
          type: stepType,
          label: option.routeLongName || option.label,
          detail: `${option.stopCount} stops · ~${option.estimatedDuration} min · ₱${option.estimatedFare}`,
          duration: option.estimatedDuration,
          fare: option.estimatedFare,
          color: stepColor,
          coordinates: option.shapeCoords || undefined,
        });
        totalDuration += option.estimatedDuration;
        totalFare += option.estimatedFare;

        // Walk from station
        if (option.walkFromStop > 0.05) {
          try {
            const walk = await getRoute(
              { latitude: option.toStop.lat, longitude: option.toStop.lon },
              to,
              'foot-walking'
            );
            steps.push({
              type: 'walk',
              label: `Walk to destination`,
              detail: `${walk.distanceKm} km · ${walk.durationMin} min`,
              duration: walk.durationMin,
              fare: 0,
              color: '#00E676',
              coordinates: walk.coordinates,
            });
            totalDuration += walk.durationMin;
          } catch {
            const walkMin = Math.round(option.walkFromStop * 12);
            steps.push({
              type: 'walk',
              label: `Walk to destination`,
              detail: `~${(option.walkFromStop * 1000).toFixed(0)}m · ${walkMin} min`,
              duration: walkMin,
              fare: 0,
              color: '#00E676',
            });
            totalDuration += walkMin;
          }
        }

        suggestions.push({
          type: option.type === 'train' ? 'train' : 'bus',
          line: option.routeName || option.line || (option.type === 'train' ? 'TRAIN' : 'BUS'),
          label: option.routeLongName || option.label,
          steps,
          totalDuration,
          totalFare,
          color: option.type === 'train' ? `#${option.color}` : '#40C4FF',
        });

      } else if (option.type === 'transfer') {
        // Bus to transfer point then another bus/jeepney
        try {
          const road1 = await getRoute(from, { latitude: option.transferStop.lat, longitude: option.transferStop.lon }, 'driving-car');
          steps.push({
            type: 'bus',
            label: `Bus/Jeepney to ${option.transferStop.name}`,
            detail: `${road1.distanceKm} km · ~${road1.durationMin} min · ₱${Math.round(parseFloat(road1.distanceKm) * 1.5 + 13)}`,
            duration: road1.durationMin,
            fare: Math.round(parseFloat(road1.distanceKm) * 1.5 + 13),
            color: '#40C4FF',
            coordinates: road1.coordinates,
          });
          totalDuration += road1.durationMin;
          totalFare += Math.round(parseFloat(road1.distanceKm) * 1.5 + 13);
        } catch {
          steps.push({
            type: 'bus',
            label: `Bus/Jeepney to ${option.transferStop.name}`,
            detail: `Transfer point`,
            duration: 15,
            fare: 13,
            color: '#40C4FF',
          });
          totalDuration += 15;
          totalFare += 13;
        }

        // Board the connecting route
        const transferFare = Math.round(
          (option.toStop && option.transferStop
            ? Math.sqrt(Math.pow(option.transferStop.lat - option.toStop.lat, 2) + Math.pow(option.transferStop.lon - option.toStop.lon, 2)) * 111
            : 2) * 1.5 + 13
        );
        steps.push({
          type: 'bus',
          label: `Board: ${option.routeLongName || option.routeName}`,
          detail: `${option.stopCount} stops · ~${option.stopCount * 5} min · ₱${transferFare}`,
          duration: option.stopCount * 5,
          fare: transferFare,
          color: `#${option.color || '40C4FF'}`,
          coordinates: option.shapeCoords || undefined,
        });
        totalDuration += option.stopCount * 5;
        totalFare += transferFare;

        suggestions.push({
          type: 'bus',
          line: 'TRANSFER',
          label: option.routeLongName || option.routeName,
          steps,
          totalDuration,
          totalFare,
          color: `#${option.color || '40C4FF'}`,
        });

      } else {
        // Bus/Jeepney
        try {
          const road = await getRoute(from, to, 'driving-car');
          steps.push({
            type: 'bus',
            label: 'Take bus/jeepney along route',
            detail: `${road.distanceKm} km · ~${road.durationMin} min · ₱${option.estimatedFare}`,
            duration: road.durationMin,
            fare: option.estimatedFare,
            color: '#40C4FF',
            coordinates: road.coordinates,
          });
          totalDuration += road.durationMin;
          totalFare += option.estimatedFare;
        } catch {
          steps.push({
            type: 'bus',
            label: 'Take bus/jeepney along route',
            detail: `~${data.directDistanceKm} km · ₱${option.estimatedFare}`,
            duration: option.estimatedDuration,
            fare: option.estimatedFare,
            color: '#40C4FF',
          });
          totalDuration += option.estimatedDuration;
          totalFare += option.estimatedFare;
        }

        suggestions.push({
          type: 'bus',
          line: 'BUS',
          label: 'Bus/Jeepney',
          steps,
          totalDuration,
          totalFare,
          color: '#40C4FF',
        });
      }
    }

    return {
      type: suggestions.length > 1 ? 'mixed' : suggestions[0]?.type || 'road',
      suggestions,
      totalDistanceKm: parseFloat(data.directDistanceKm),
    };

  } catch (err) {
    console.log('GTFS route error:', err);
    return getRoadFallback(from, to);
  }
};

const getRoadFallback = async (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): Promise<CommuteResult> => {
  try {
    const road = await getRoute(from, to, 'driving-car');
    const dist = parseFloat(road.distanceKm);
    const fare = Math.round(dist * 1.5 + 13);
    return {
      type: 'road',
      suggestions: [{
        type: 'bus',
        line: 'BUS',
        label: 'Bus/Jeepney',
        steps: [{
          type: 'bus',
          label: 'Take bus/jeepney along route',
          detail: `${road.distanceKm} km · ~${road.durationMin} min · ₱${fare}`,
          duration: road.durationMin,
          fare,
          color: '#40C4FF',
          coordinates: road.coordinates,
        }],
        totalDuration: road.durationMin,
        totalFare: fare,
        color: '#40C4FF',
      }],
      totalDistanceKm: dist,
    };
  } catch {
    return {
      type: 'road',
      suggestions: [],
      totalDistanceKm: 0,
    };
  }
};
