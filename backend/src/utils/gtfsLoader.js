const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const GTFS_DIR = path.join(__dirname, '../../gtfs');

let loaded = false;
const routesByNumber = new Map();
const routesById = new Map();
const stopsById = new Map();
const stopsByRoute = new Map();
const routesByStop = new Map();
const tripsByRoute = new Map();
const stopTimesByTrip = new Map();

const loadCSV = (filename) => {
  const content = fs.readFileSync(path.join(GTFS_DIR, filename), 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true });
};

const load = () => {
  if (loaded) return;
  console.log('Loading GTFS data...');

  // Load routes
  loadCSV('routes.txt').forEach(r => {
    const route = {
      id: r.route_id,
      shortName: r.route_short_name || '',
      longName: r.route_long_name || '',
      type: parseInt(r.route_type) || 3,
      color: r.route_color || '40C4FF',
    };
    routesById.set(r.route_id, route);
    if (r.route_short_name) routesByNumber.set(r.route_short_name.trim(), route);
  });

  // Load stops
  loadCSV('stops.txt').forEach(s => {
    stopsById.set(s.stop_id, {
      id: s.stop_id,
      name: s.stop_name || '',
      lat: parseFloat(s.stop_lat),
      lon: parseFloat(s.stop_lon),
    });
  });

  // Load trips
  loadCSV('trips.txt').forEach(t => {
    if (!tripsByRoute.has(t.route_id)) tripsByRoute.set(t.route_id, []);
    tripsByRoute.get(t.route_id).push(t.trip_id);
  });

  // Load stop_times and build indexes
  const tripStopMap = new Map();
  loadCSV('stop_times.txt').forEach(st => {
    if (!tripStopMap.has(st.trip_id)) tripStopMap.set(st.trip_id, []);
    tripStopMap.get(st.trip_id).push({ stopId: st.stop_id, seq: parseInt(st.stop_sequence) });
    stopTimesByTrip.set(st.trip_id, tripStopMap.get(st.trip_id));
  });

  // Sort stop times by sequence
  tripStopMap.forEach((stops, tripId) => {
    stops.sort((a, b) => a.seq - b.seq);
  });

  // Build stopsByRoute and routesByStop
  routesById.forEach((route, routeId) => {
    const trips = tripsByRoute.get(routeId) || [];
    if (trips.length === 0) return;

    // Use first trip to get stop order
    const firstTrip = trips[0];
    const tripStops = tripStopMap.get(firstTrip) || [];
    const stops = tripStops.map(ts => stopsById.get(ts.stopId)).filter(Boolean);

    stopsByRoute.set(routeId, stops);

    stops.forEach(stop => {
      if (!routesByStop.has(stop.id)) routesByStop.set(stop.id, []);
      routesByStop.get(stop.id).push(route);
    });
  });

  loaded = true;
  console.log(`GTFS loaded: ${routesById.size} routes, ${stopsById.size} stops`);
};

module.exports = {
  load,
  routesByNumber,
  routesById,
  stopsById,
  stopsByRoute,
  routesByStop,
  tripsByRoute,
  stopTimesByTrip,
};
