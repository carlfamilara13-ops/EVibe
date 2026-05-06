import axios from 'axios';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const OCM_KEY = process.env.EXPO_PUBLIC_OCM_KEY!;
const BASE = 'https://api.openchargemap.io/v3/poi';

const mockStations = (latitude: number, longitude: number) => [
  { id: '1', name: 'SM North EVCS', address: 'SM North EDSA, QC', distance: '1.2 km', type: 'DC Fast', power: '50 kW', cost: '₱12/kWh', time: '30 min', connectors: ['CCS2', 'CHAdeMO'], available: 2, total: 4, coordinate: { latitude: latitude + 0.01, longitude: longitude + 0.01 } },
  { id: '2', name: 'Ayala Malls EVCS', address: 'Ayala Ave, Makati', distance: '2.5 km', type: 'AC Level 2', power: '22 kW', cost: '₱10/kWh', time: '90 min', connectors: ['Type 2'], available: 1, total: 2, coordinate: { latitude: latitude - 0.01, longitude: longitude + 0.02 } },
  { id: '3', name: 'BGC Charging Hub', address: 'BGC, Taguig', distance: '3.1 km', type: 'DC Fast', power: '100 kW', cost: '₱15/kWh', time: '20 min', connectors: ['CCS2'], available: 3, total: 6, coordinate: { latitude: latitude + 0.02, longitude: longitude - 0.01 } },
  { id: '4', name: 'Robinsons Galleria', address: 'EDSA, Ortigas', distance: '4.0 km', type: 'AC Level 2', power: '7 kW', cost: '₱8/kWh', time: '240 min', connectors: ['Type 2', 'Type 1'], available: 0, total: 3, coordinate: { latitude: latitude - 0.02, longitude: longitude - 0.02 } },
  { id: '5', name: 'NLEX EV Station', address: 'NLEX, Valenzuela', distance: '5.8 km', type: 'DC Fast', power: '60 kW', cost: '₱13/kWh', time: '25 min', connectors: ['CCS2', 'CHAdeMO'], available: 1, total: 2, coordinate: { latitude: latitude + 0.03, longitude: longitude + 0.03 } },
];

export const fetchStations = async (latitude: number, longitude: number, distance = 10) => {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    return mockStations(latitude, longitude);
  }
  const res = await axios.get(BASE, {
    params: { key: OCM_KEY, latitude, longitude, distance, distanceunit: 'km', maxresults: 10, compact: true, verbose: false, output: 'json' },
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
    coordinate: { latitude: s.AddressInfo?.Latitude, longitude: s.AddressInfo?.Longitude },
  }));
};
