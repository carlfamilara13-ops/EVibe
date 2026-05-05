// Emission factors (kg CO₂ per km)
const EMISSION_FACTORS = {
  walking: 0,
  biking: 0,
  commute: 0.08,
  ev: 0.03,
  car: 0.20, // for comparison
};

// 1 tree absorbs 10 kg CO₂ per year
const TREE_ABSORPTION_PER_YEAR = 10;

/**
 * Calculate carbon emissions and savings for a trip
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} mode - Transport mode: 'walking', 'biking', 'commute', 'ev'
 * @returns {object} Carbon data with emissions, savings, trees, and percentage
 */
exports.calculateCarbon = (distanceKm, mode) => {
  const distance = parseFloat(distanceKm) || 0;
  
  // Get emission factor for the chosen mode
  const modeEmissionFactor = EMISSION_FACTORS[mode] || EMISSION_FACTORS.ev;
  
  // Calculate CO₂ for this trip
  const tripEmission = distance * modeEmissionFactor;
  
  // Calculate what a car would emit
  const carEmission = distance * EMISSION_FACTORS.car;
  
  // Calculate savings
  const savedKg = carEmission - tripEmission;
  const savedPercentage = carEmission > 0 ? ((savedKg / carEmission) * 100) : 0;
  
  // Calculate tree equivalents
  const treesEquivalent = savedKg / TREE_ABSORPTION_PER_YEAR;
  
  return {
    distanceKm: distance,
    mode,
    tripEmission: parseFloat(tripEmission.toFixed(3)),
    carEmission: parseFloat(carEmission.toFixed(3)),
    savedKg: parseFloat(savedKg.toFixed(3)),
    savedPercentage: parseFloat(savedPercentage.toFixed(1)),
    treesEquivalent: parseFloat(treesEquivalent.toFixed(2)),
    emissionFactor: modeEmissionFactor,
  };
};

/**
 * Calculate energy consumption for EV (estimate)
 * Average EV efficiency: 0.2 kWh/km
 */
exports.calculateEVEnergy = (distanceKm) => {
  const distance = parseFloat(distanceKm) || 0;
  const energyKwh = distance * 0.2; // 0.2 kWh per km average
  return parseFloat(energyKwh.toFixed(2));
};
