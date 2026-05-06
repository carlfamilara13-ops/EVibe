import axios from 'axios';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const ORS_KEY = process.env.EXPO_PUBLIC_ORS_KEY!;
const BASE = 'https://api.openrouteservice.org/v2';
const orsClient = axios.create();

const interpolate = (from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }, steps = 20) => {
  return Array.from({ length: steps + 1 }, (_, i) => ({
    latitude: from.latitude + (to.latitude - from.latitude) * (i / steps),
    longitude: from.longitude + (to.longitude - from.longitude) * (i / steps),
  }));
};

export const getRoute = async (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  profile: string = 'driving-car'
) => {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    const distKm = (Math.sqrt(Math.pow(to.latitude - from.latitude, 2) + Math.pow(to.longitude - from.longitude, 2)) * 111).toFixed(1);
    const durationMin = Math.round(parseFloat(distKm) * (profile === 'foot-walking' ? 12 : profile === 'cycling-regular' ? 4 : 2));
    return { coordinates: interpolate(from, to), distanceKm: distKm, durationMin };
  }
  const res = await orsClient.post(
    `${BASE}/directions/${profile}/geojson`,
    { coordinates: [[from.longitude, from.latitude], [to.longitude, to.latitude]] },
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
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return { latitude: 14.5995, longitude: 120.9842, label: address };
  }
  const res = await orsClient.get('https://api.openrouteservice.org/geocode/search', {
    params: { api_key: ORS_KEY, text: address, size: 1, 'boundary.rect.min_lon': 116.928, 'boundary.rect.min_lat': 4.587, 'boundary.rect.max_lon': 126.604, 'boundary.rect.max_lat': 21.321 },
    headers: { Accept: 'application/json' },
  });
  const feature = res.data.features[0];
  if (!feature) throw new Error('Address not found');
  const [lng, lat] = feature.geometry.coordinates;
  return { latitude: lat, longitude: lng, label: feature.properties.label };
};

export const autoComplete = async (text: string, lat?: number, lng?: number) => {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return [
      { label: `${text}, Manila`, latitude: 14.5995, longitude: 120.9842 },
      { label: `${text}, Quezon City`, latitude: 14.6760, longitude: 121.0437 },
      { label: `${text}, Makati`, latitude: 14.5547, longitude: 121.0244 },
      { label: `${text}, BGC Taguig`, latitude: 14.5502, longitude: 121.0485 },
      { label: `${text}, Pasig`, latitude: 14.5764, longitude: 121.0851 },
    ];
  }
  const res = await orsClient.get('https://api.openrouteservice.org/geocode/autocomplete', {
    params: { api_key: ORS_KEY, text, size: 5, 'boundary.rect.min_lon': 116.928, 'boundary.rect.min_lat': 4.587, 'boundary.rect.max_lon': 126.604, 'boundary.rect.max_lat': 21.321, ...(lat && lng ? { 'focus.point.lat': lat, 'focus.point.lon': lng } : { 'focus.point.lat': 12.8797, 'focus.point.lon': 121.7740 }) },
    headers: { Accept: 'application/json' },
  });
  const PH = { minLat: 4.587, maxLat: 21.321, minLon: 116.928, maxLon: 126.604 };
  return res.data.features
    .map((f: any) => ({ label: f.properties.label, latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] }))
    .filter((f: any) => f.latitude >= PH.minLat && f.latitude <= PH.maxLat && f.longitude >= PH.minLon && f.longitude <= PH.maxLon);
};
