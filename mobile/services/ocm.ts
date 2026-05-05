import axios from 'axios';

const OCM_KEY = process.env.EXPO_PUBLIC_OCM_KEY!;
const BASE = 'https://api.openchargemap.io/v3/poi';

export const fetchStations = async (latitude: number, longitude: number, distance = 10) => {
  const res = await axios.get(BASE, {
    params: {
      key: OCM_KEY,
      latitude,
      longitude,
      distance,
      distanceunit: 'km',
      maxresults: 10,
      compact: true,
      verbose: false,
      output: 'json',
    },
  });

  return res.data.map((s: any) => ({
    id: String(s.ID),
    name: s.AddressInfo?.Title || 'Unknown Station',
    address: s.AddressInfo?.AddressLine1 || '',
    distance: `${s.AddressInfo?.Distance?.toFixed(1) ?? '?'} km`,
    type: s.Connections?.[0]?.ConnectionType?.Title || 'Unknown',
    power: s.Connections?.[0]?.PowerKW ? `${s.Connections[0].PowerKW} kW` : 'N/A',
    cost: s.UsageCost || 'Free',
    time: s.Connections?.[0]?.PowerKW ? `${Math.round(30000 / s.Connections[0].PowerKW)} min` : 'N/A',
    connectors: s.Connections?.map((c: any) => c.ConnectionType?.Title || 'Unknown').filter(Boolean) || [],
    available: s.StatusType?.IsOperational ? 1 : 0,
    total: s.Connections?.length || 1,
    coordinate: {
      latitude: s.AddressInfo?.Latitude,
      longitude: s.AddressInfo?.Longitude,
    },
  }));
};
