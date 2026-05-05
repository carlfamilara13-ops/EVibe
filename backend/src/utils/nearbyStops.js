const { load, stopsById, routesByStop } = require('./gtfsLoader');

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const getNearbyStops = (lat, lon, radiusMeters = 500) => {
  load();
  const results = [];
  stopsById.forEach(stop => {
    if (isNaN(stop.lat) || isNaN(stop.lon)) return;
    const dist = haversine(lat, lon, stop.lat, stop.lon);
    if (dist <= radiusMeters) {
      const routes = routesByStop.get(stop.id) || [];
      results.push({
        ...stop,
        distanceMeters: Math.round(dist),
        routes: routes.map(r => ({ id: r.id, shortName: r.shortName, longName: r.longName, type: r.type })),
      });
    }
  });
  return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
};

module.exports = { getNearbyStops };
