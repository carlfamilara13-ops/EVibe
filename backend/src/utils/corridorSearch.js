const { load, routesById, stopsByRoute } = require('./gtfsLoader');

const searchRoutesByKeyword = (keyword) => {
  load();
  const kw = keyword.toLowerCase();
  const results = [];
  routesById.forEach(route => {
    if (route.longName.toLowerCase().includes(kw) || route.shortName.toLowerCase().includes(kw)) {
      const stops = stopsByRoute.get(route.id) || [];
      results.push({
        id: route.id,
        shortName: route.shortName,
        longName: route.longName,
        type: route.type,
        color: route.color,
        stopCount: stops.length,
        firstStop: stops[0]?.name || '',
        lastStop: stops[stops.length - 1]?.name || '',
      });
    }
  });
  return results.slice(0, 20);
};

module.exports = { searchRoutesByKeyword };
