# Carbon Footprint Feature - Implementation Guide

## Overview
The Carbon Footprint feature calculates real-time CO₂ emissions based on the user's chosen transport mode and route distance from OpenRouteService (ORS).

## Emission Factors (kg CO₂ per km)
- **Walking**: 0 kg/km
- **Biking**: 0 kg/km  
- **Commute**: 0.08 kg/km
- **EV**: 0.03 kg/km
- **Car (comparison)**: 0.20 kg/km

## Tree Absorption
- 1 tree absorbs **10 kg CO₂ per year**

## Backend Implementation

### 1. Carbon Service (`backend/src/services/carbonService.js`)
- `calculateCarbon(distanceKm, mode)` - Calculates emissions, savings, and tree equivalents
- `calculateEVEnergy(distanceKm)` - Estimates EV energy consumption (0.2 kWh/km)

### 2. Trip Model Updates (`backend/src/models/Trip.js`)
Added `carbonData` object:
```javascript
carbonData: {
  tripEmission: Number,      // CO₂ from chosen mode
  carEmission: Number,        // CO₂ if using car
  savedKg: Number,            // CO₂ saved vs car
  savedPercentage: Number,    // % reduction
  treesEquivalent: Number,    // Trees planted equivalent
  energyKwh: Number,          // Energy used (EV only)
}
```

### 3. API Endpoints
- `POST /api/trips/:tripId/carbon` - Calculate and store carbon data
  - Body: `{ distance, mode }`
- `GET /api/trips/:tripId/carbon` - Retrieve carbon data for a trip

## Frontend Implementation

### 1. Custom Hook (`mobile/hooks/useCarbonData.ts`)
- Fetches carbon data from active trip
- Returns: `{ loading, error, carbonData, refetch }`
- Handles loading states and errors

### 2. Carbon Tab (`mobile/app/(tabs)/carbon.tsx`)
- **Preserved UI**: All styles, colors, layouts, and animations kept identical
- **Data-driven**: Replaced hardcoded values with real data from `useCarbonData`
- **Loading State**: Shows spinner while fetching data
- **Error State**: Displays friendly message if no data available
- **Dynamic Icons**: Shows correct icon based on transport mode

### 3. Setup Screen (`mobile/app/setup.tsx`)
- Creates trip with ORS distance
- Calls `calculateTripCarbon` API
- Saves trip to AsyncStorage
- Navigates to main app

## Data Flow

1. **User plans trip** → Setup screen
2. **ORS calculates distance** → Based on mode (walking/biking/commute/EV)
3. **Trip created** → Stored in MongoDB
4. **Carbon calculated** → Using emission factors
5. **Data saved** → In trip.carbonData
6. **Carbon tab loads** → Fetches via `useCarbonData` hook
7. **UI displays** → Real calculations with preserved design

## Mode-Specific Behavior

### Walking/Biking
- 0 emissions
- 100% savings vs car
- Shows full car emission as "saved"

### Commute
- Uses ORS driving-car profile for distance
- 0.08 kg CO₂/km emission factor
- 60% reduction vs car

### EV
- Uses ORS driving-car profile for distance
- 0.03 kg CO₂/km emission factor
- Calculates energy consumption (kWh)
- 85% reduction vs car

## Testing

1. **Start backend**: `cd backend && npm start`
2. **Start mobile**: `cd mobile && npx expo start`
3. **Create trip**: Use setup screen with different modes
4. **View carbon**: Navigate to Carbon tab
5. **Verify calculations**: Check console logs for accuracy

## Example Calculation

**Trip**: 100 km by EV
- EV emission: 100 × 0.03 = **3 kg CO₂**
- Car emission: 100 × 0.20 = **20 kg CO₂**
- Saved: 20 - 3 = **17 kg CO₂**
- Percentage: (17/20) × 100 = **85%**
- Trees: 17 / 10 = **1.7 trees**
- Energy: 100 × 0.2 = **20 kWh**

## UI Features Preserved

✅ Hero card with glowing effects  
✅ Large CO₂ saved number  
✅ Tree icons (stacked, max 5)  
✅ Reduction badge with percentage  
✅ Comparison bars (EV vs Gas)  
✅ Side-by-side stat boxes  
✅ Trip details cards  
✅ Impact message card  
✅ All colors, fonts, spacing  

## Error Handling

- No active trip → Shows "Start a trip" message
- No carbon data → Shows "No data available"
- API error → Displays error message
- Loading → Shows spinner with preserved layout
