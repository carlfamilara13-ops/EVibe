const { getNearbyStops } = require('../utils/nearbyStops');
const { getRouteByNumber, getRouteById } = require('../utils/routeLookup');
const { getStopsForRoute, getRoutesForStop } = require('../utils/routeStops');
const { searchRoutesByKeyword } = require('../utils/corridorSearch');
const { load, stopsById } = require('../utils/gtfsLoader');

// GET /api/gtfs/nearby?lat=14.5&lon=120.9&radius=500
exports.nearby = (req, res) => {
  try {
    const { lat, lon, radius = 500 } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
    const stops = getNearbyStops(parseFloat(lat), parseFloat(lon), parseFloat(radius));
    res.json({ count: stops.length, stops });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/gtfs/route?number=MRT-3
exports.routeByNumber = (req, res) => {
  try {
    const { number } = req.query;
    if (!number) return res.status(400).json({ error: 'number required' });
    const route = getRouteByNumber(number);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/gtfs/route/:id/stops
exports.routeStops = (req, res) => {
  try {
    const stops = getStopsForRoute(req.params.id);
    res.json({ routeId: req.params.id, count: stops.length, stops });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/gtfs/stop/:id/routes
exports.stopRoutes = (req, res) => {
  try {
    const routes = getRoutesForStop(req.params.id);
    res.json({ stopId: req.params.id, count: routes.length, routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/gtfs/search?q=EDSA
exports.search = (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q required' });
    const routes = searchRoutesByKeyword(q);
    res.json({ count: routes.length, routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/gtfs/commute?fromLat=&fromLon=&toLat=&toLon=
exports.commute = (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon } = req.query;
    if (!fromLat || !fromLon || !toLat || !toLon)
      return res.status(400).json({ error: 'fromLat, fromLon, toLat, toLon required' });

    load();

    const fLat = parseFloat(fromLat);
    const fLon = parseFloat(fromLon);
    const tLat = parseFloat(toLat);
    const tLon = parseFloat(toLon);

    // Get nearby stops for origin and destination
    const fromStops = getNearbyStops(fLat, fLon, 1000);
    const toStops = getNearbyStops(tLat, tLon, 1000);

    if (fromStops.length === 0 || toStops.length === 0) {
      return res.json({ suggestions: [], fromStops, toStops });
    }

    const toStopIds = new Set(toStops.map(s => s.id));
    const suggestions = [];
    const seenRoutes = new Set();

    // Sort fromStops to prioritize train stops
    const sortedFromStops = [
      ...fromStops.filter(s => s.routes.some(r => r.type === 2)),
      ...fromStops.filter(s => s.routes.every(r => r.type !== 2)),
    ];

    for (const fromStop of sortedFromStops.slice(0, 20)) {
      for (const fromRoute of fromStop.routes) {
        if (seenRoutes.has(fromRoute.id)) continue;

        const { getStopsForRoute } = require('../utils/routeStops');
        const routeStops = getStopsForRoute(fromRoute.id);
        const fromIdx = routeStops.findIndex(s => s.id === fromStop.id);
        if (fromIdx === -1) continue;

        for (let i = fromIdx + 1; i < routeStops.length; i++) {
          if (toStopIds.has(routeStops[i].id)) {
            const toStop = toStops.find(s => s.id === routeStops[i].id);
            seenRoutes.add(fromRoute.id);

            const stopCount = i - fromIdx;
            const isTrain = fromRoute.type === 2;

            suggestions.push({
              type: isTrain ? 'train' : 'bus',
              routeId: fromRoute.id,
              routeName: fromRoute.shortName || fromRoute.longName,
              routeLongName: fromRoute.longName,
              color: isTrain ? (fromRoute.longName.includes('LRT 1') || fromRoute.longName.includes('Roosevelt') ? 'fdff00' : fromRoute.longName.includes('LRT 2') || fromRoute.longName.includes('Santolan') ? 'a520a1' : 'FF6B35') : (fromRoute.color || '40C4FF'),
              fromStop: { id: fromStop.id, name: fromStop.name, lat: fromStop.lat, lon: fromStop.lon, distanceMeters: fromStop.distanceMeters },
              toStop: { id: routeStops[i].id, name: routeStops[i].name, lat: routeStops[i].lat, lon: routeStops[i].lon, distanceMeters: toStop?.distanceMeters || 0 },
              stopCount,
              estimatedDuration: stopCount * (isTrain ? 3 : 5) + Math.round(fromStop.distanceMeters / 80),
              estimatedFare: isTrain
                ? 12 + Math.round(stopCount * 1.5)
                : Math.round(stopCount * 0.5 + 13),
            });

            if (suggestions.length >= 6) break;
          }
        }
        if (suggestions.length >= 6) break;
      }
      if (suggestions.length >= 6) break;
    }

    res.json({
      fromStops: fromStops.slice(0, 5),
      toStops: toStops.slice(0, 5),
      suggestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
