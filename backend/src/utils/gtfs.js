const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const GTFS_DIR = path.join(__dirname, '../../gtfs');

let stopsCache = null;
let routesCache = null;
let tripsCache = null;
let stopTripsIndex = null;
let tripStopsIndex = null;
let shapesCache = null;
let tripShapeIndex = null;

const loadCSV = (filename) => {
  const content = fs.readFileSync(path.join(GTFS_DIR, filename), 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true });
};

const getStops = () => {
  if (!stopsCache) {
    stopsCache = {};
    loadCSV('stops.txt').forEach(s => {
      stopsCache[s.stop_id] = {
        id: s.stop_id,
        name: s.stop_name,
        lat: parseFloat(s.stop_lat),
        lon: parseFloat(s.stop_lon),
      };
    });
  }
  return stopsCache;
};

const getRoutes = () => {
  if (!routesCache) {
    routesCache = {};
    loadCSV('routes.txt').forEach(r => {
      routesCache[r.route_id] = {
        id: r.route_id,
        name: r.route_short_name || r.route_long_name,
        longName: r.route_long_name,
        type: parseInt(r.route_type),
        agency: r.agency_id,
        color: r.route_color || '00E676',
      };
    });
  }
  return routesCache;
};

const getTrips = () => {
  if (!tripsCache) {
    tripsCache = {};
    loadCSV('trips.txt').forEach(t => {
      tripsCache[t.trip_id] = {
        id: t.trip_id,
        routeId: t.route_id,
        shapeId: t.shape_id,
        headsign: t.trip_headsign,
      };
    });
  }
  return tripsCache;
};

const getShapes = () => {
  if (!shapesCache) {
    shapesCache = {};
    loadCSV('shapes.txt').forEach(s => {
      if (!shapesCache[s.shape_id]) shapesCache[s.shape_id] = [];
      shapesCache[s.shape_id].push({
        seq: parseInt(s.shape_pt_sequence),
        lat: parseFloat(s.shape_pt_lat),
        lon: parseFloat(s.shape_pt_lon),
      });
    });
    Object.keys(shapesCache).forEach(id => {
      shapesCache[id].sort((a, b) => a.seq - b.seq);
    });
  }
  return shapesCache;
};

const buildIndexes = () => {
  if (stopTripsIndex) return;
  console.log('Building GTFS indexes...');
  getTrips();
  getRoutes();
  getShapes();
  stopTripsIndex = {};
  tripStopsIndex = {};
  tripShapeIndex = {};

  const trips = getTrips();
  Object.values(trips).forEach(t => {
    if (t.shapeId) tripShapeIndex[t.id] = t.shapeId;
  });

  const stopTimes = loadCSV('stop_times.txt');
  stopTimes.forEach(st => {
    const tripId = st.trip_id;
    const stopId = st.stop_id;
    const seq = parseInt(st.stop_sequence);

    if (!tripStopsIndex[tripId]) tripStopsIndex[tripId] = [];
    tripStopsIndex[tripId].push({ stopId, seq });

    if (!stopTripsIndex[stopId]) stopTripsIndex[stopId] = [];
    if (!stopTripsIndex[stopId].includes(tripId)) {
      stopTripsIndex[stopId].push(tripId);
    }
  });

  Object.keys(tripStopsIndex).forEach(tripId => {
    tripStopsIndex[tripId].sort((a, b) => a.seq - b.seq);
  });

  console.log('GTFS indexes built.');
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getNearestStops = (lat, lon, limit = 5, maxDistKm = 1) => {
  const stops = getStops();
  return Object.values(stops)
    .map(s => ({ ...s, distance: getDistance(lat, lon, s.lat, s.lon) }))
    .filter(s => s.distance <= maxDistKm && !isNaN(s.lat) && !isNaN(s.lon))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

// Get shape coordinates for a trip (sliced between from and to stop)
const getShapeForTrip = (tripId, fromStopLat, fromStopLon, toStopLat, toStopLon) => {
  const shapes = getShapes();
  const shapeId = tripShapeIndex[tripId];
  if (!shapeId || !shapes[shapeId]) return null;

  const pts = shapes[shapeId];
  // Find closest points to from and to stops
  let fromIdx = 0, toIdx = pts.length - 1;
  let minFromDist = Infinity, minToDist = Infinity;

  pts.forEach((p, i) => {
    const dFrom = getDistance(fromStopLat, fromStopLon, p.lat, p.lon);
    const dTo = getDistance(toStopLat, toStopLon, p.lat, p.lon);
    if (dFrom < minFromDist) { minFromDist = dFrom; fromIdx = i; }
    if (dTo < minToDist) { minToDist = dTo; toIdx = i; }
  });

  if (fromIdx > toIdx) [fromIdx, toIdx] = [toIdx, fromIdx];
  return pts.slice(fromIdx, toIdx + 1).map(p => ({ latitude: p.lat, longitude: p.lon }));
};

const findTransitRoutes = (fromLat, fromLon, toLat, toLon) => {
  buildIndexes();
  const stops = getStops();
  const trips = getTrips();
  const routes = getRoutes();

  const fromStops = getNearestStops(fromLat, fromLon, 10, 2);
  const toStops = getNearestStops(toLat, toLon, 15, 3);

  if (fromStops.length === 0 || toStops.length === 0) return [];

  const toStopIds = new Set(toStops.map(s => s.id));
  const toStopMap = {};
  toStops.forEach(s => toStopMap[s.id] = s);

  const results = [];
  const seenRoutes = new Set();

  // Direct routes
  for (const fromStop of fromStops) {
    const tripsAtFrom = stopTripsIndex[fromStop.id] || [];
    for (const tripId of tripsAtFrom) {
      const tripStops = tripStopsIndex[tripId] || [];
      const fromIdx = tripStops.findIndex(s => s.stopId === fromStop.id);
      if (fromIdx === -1) continue;

      for (let i = fromIdx + 1; i < tripStops.length; i++) {
        const stopId = tripStops[i].stopId;
        if (toStopIds.has(stopId)) {
          const toStop = toStopMap[stopId];
          const trip = trips[tripId];
          if (!trip) continue;
          const route = routes[trip.routeId];
          if (!route) continue;

          const routeKey = `${trip.routeId}`;
          if (seenRoutes.has(routeKey)) continue;
          seenRoutes.add(routeKey);

          const stopCount = i - fromIdx;
          const isTrain = route.type === 2;

          // Get shape coordinates if available
          const shapeCoords = getShapeForTrip(tripId, fromStop.lat, fromStop.lon, toStop.lat, toStop.lon);

          results.push({
            type: isTrain ? 'train' : 'bus',
            routeId: trip.routeId,
            tripId,
            routeName: route.name || route.longName,
            routeLongName: route.longName,
            color: route.color,
            agency: route.agency,
            fromStop: { ...fromStop },
            toStop: { ...toStop, distance: getDistance(toLat, toLon, toStop.lat, toStop.lon) },
            stopCount,
            shapeCoords,
            estimatedDuration: stopCount * (isTrain ? 3 : 5),
            estimatedFare: isTrain
              ? 12 + Math.round(stopCount * 1.5)
              : Math.round(getDistance(fromStop.lat, fromStop.lon, toStop.lat, toStop.lon) * 1.5 + 13),
          });

          if (results.length >= 4) break;
        }
      }
      if (results.length >= 4) break;
    }
    if (results.length >= 4) break;
  }

  // Transfer routes if no direct found
  if (results.length === 0) {
    for (const toStop of toStops) {
      const tripsAtTo = stopTripsIndex[toStop.id] || [];
      for (const tripId of tripsAtTo) {
        const tripStops = tripStopsIndex[tripId] || [];
        const toIdx = tripStops.findIndex(s => s.stopId === toStop.id);
        if (toIdx === -1 || toIdx === 0) continue;

        const trip = trips[tripId];
        if (!trip) continue;
        const route = routes[trip.routeId];
        if (!route) continue;

        const routeKey = `transfer-${trip.routeId}`;
        if (seenRoutes.has(routeKey)) continue;
        seenRoutes.add(routeKey);

        const transferStop = stops[tripStops[0].stopId];
        if (!transferStop) continue;

        const shapeCoords = getShapeForTrip(tripId, transferStop.lat, transferStop.lon, toStop.lat, toStop.lon);

        results.push({
          type: 'transfer',
          routeId: trip.routeId,
          tripId,
          routeName: route.name || route.longName,
          routeLongName: route.longName,
          color: route.color,
          agency: route.agency,
          transferStop,
          fromStop: fromStops[0],
          toStop: { ...toStop, distance: getDistance(toLat, toLon, toStop.lat, toStop.lon) },
          stopCount: toIdx,
          shapeCoords,
          estimatedDuration: toIdx * 5 + Math.round(getDistance(fromLat, fromLon, transferStop.lat, transferStop.lon) * 4),
          estimatedFare:
            Math.round(getDistance(fromLat, fromLon, transferStop.lat, transferStop.lon) * 1.5 + 13) +
            Math.round(getDistance(transferStop.lat, transferStop.lon, toStop.lat, toStop.lon) * 1.5 + 13),
        });

        if (results.length >= 3) break;
      }
      if (results.length >= 3) break;
    }
  }

  return results;
};

module.exports = { getStops, getRoutes, getTrips, getNearestStops, getDistance, findTransitRoutes };
