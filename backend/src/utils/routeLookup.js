const { load, routesByNumber, routesById, stopsByRoute } = require('./gtfsLoader');

const getRouteByNumber = (routeNumber) => {
  load();
  const route = routesByNumber.get(routeNumber.trim());
  if (!route) return null;
  return {
    ...route,
    stops: stopsByRoute.get(route.id) || [],
  };
};

const getRouteById = (routeId) => {
  load();
  const route = routesById.get(routeId);
  if (!route) return null;
  return {
    ...route,
    stops: stopsByRoute.get(routeId) || [],
  };
};

module.exports = { getRouteByNumber, getRouteById };
