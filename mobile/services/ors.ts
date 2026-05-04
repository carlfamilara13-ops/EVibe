import axios from 'axios';

const ORS_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjMyMmNlMTM2NWY0MDQ1MjY5NzVjMmQ3NDZjZmMyMzNlIiwiaCI6Im11cm11cjY0In0=';
const BASE = 'https://api.openrouteservice.org/v2';

const orsClient = axios.create();

export const getRoute = async (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) => {
  const res = await orsClient.post(
    `${BASE}/directions/driving-car/geojson`,
    {
      coordinates: [
        [from.longitude, from.latitude],
        [to.longitude, to.latitude],
      ],
    },
    { headers: { Authorization: ORS_KEY, 'Content-Type': 'application/json' } }
  );

  const coords = res.data.features[0].geometry.coordinates;
  const summary = res.data.features[0].properties.summary;

  return {
    coordinates: coords.map(([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng })),
    distanceKm: (summary.distance / 1000).toFixed(1),
    durationMin: Math.round(summary.duration / 60),
  };
};

export const geocode = async (address: string) => {
  const res = await orsClient.get('https://api.openrouteservice.org/geocode/search', {
    params: { api_key: ORS_KEY, text: address, size: 1 },
  });
  const feature = res.data.features[0];
  if (!feature) throw new Error('Address not found');
  const [lng, lat] = feature.geometry.coordinates;
  return { latitude: lat, longitude: lng, label: feature.properties.label };
};
