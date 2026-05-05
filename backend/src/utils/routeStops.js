const { load, stopsByRoute, routesByStop } = require('./gtfsLoader');

const getStopsForRoute = (routeId) => {
  load();
  const stops = stopsByRoute.get(routeId) || [];
  return stops.map((s, i) => ({ ...s, sequence: i + 1 }));
};

const getRoutesForStop = (stopId) => {
  load();
  return routesByStop.get(stopId) || [];
};

module.exports = { getStopsForRoute, getRoutesForStop };
