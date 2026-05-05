import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateTripCarbon } from '@/services/api';
import { EV } from '@/constants/theme';

export default function DebugCarbonScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tripInfo, setTripInfo] = useState<any>(null);

  const checkTrip = async () => {
    const tripStr = await AsyncStorage.getItem('activeTrip');
    if (tripStr) {
      const trip = JSON.parse(tripStr);
      setTripInfo(trip);
      Alert.alert('Active Trip Found', JSON.stringify(trip, null, 2));
    } else {
      Alert.alert('No Active Trip', 'Please start a trip from setup screen');
    }
  };

  const recalculateCarbon = async () => {
    setLoading(true);
    try {
      const tripStr = await AsyncStorage.getItem('activeTrip');
      if (!tripStr) {
        Alert.alert('Error', 'No active trip found');
        return;
      }

      const trip = JSON.parse(tripStr);
      
      // Use existing distance or default to 150km for testing
      const distance = trip.distance > 0 ? trip.distance : 150;
      const mode = trip.mode || 'ev';

      console.log('Recalculating carbon for trip:', trip._id, 'distance:', distance, 'mode:', mode);

      const response = await calculateTripCarbon(trip._id, distance, mode);
      console.log('Carbon calculation response:', response.data);

      // Update local storage with new trip data
      const updatedTrip = response.data.trip;
      await AsyncStorage.setItem('activeTrip', JSON.stringify(updatedTrip));

      Alert.alert('Success', `Carbon data calculated!\nDistance: ${distance} km\nSaved: ${response.data.carbonData.savedKg.toFixed(1)} kg CO₂`);
      
      // Refresh the trip data
      setTripInfo(updatedTrip);
    } catch (err: any) {
      console.error('Recalculate error:', err?.response?.data || err?.message);
      Alert.alert('Error', err?.response?.data?.error || 'Failed to calculate carbon');
    } finally {
      setLoading(false);
    }
  };

  const clearTrip = async () => {
    await AsyncStorage.removeItem('activeTrip');
    setTripInfo(null);
    Alert.alert('Cleared', 'Active trip removed. Go to setup to create a new one.');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Carbon Debug</Text>

      {tripInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Active Trip</Text>
          <Text style={styles.infoText}>ID: {tripInfo._id}</Text>
          <Text style={styles.infoText}>Origin: {tripInfo.origin}</Text>
          <Text style={styles.infoText}>Destination: {tripInfo.destination}</Text>
          <Text style={styles.infoText}>Distance: {tripInfo.distance || 'N/A'} km</Text>
          <Text style={styles.infoText}>Mode: {tripInfo.mode || 'N/A'}</Text>
          <Text style={styles.infoText}>Carbon Data: {tripInfo.carbonData ? 'Yes' : 'No'}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={checkTrip}>
        <Text style={styles.buttonText}>Check Active Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={recalculateCarbon} disabled={loading}>
        {loading ? <ActivityIndicator color={EV.bg} /> : <Text style={styles.buttonText}>Recalculate Carbon Data</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={clearTrip}>
        <Text style={styles.buttonText}>Clear Active Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/setup')}>
        <Text style={styles.buttonText}>Go to Setup</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EV.bg, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  backText: { color: EV.primary, fontSize: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: EV.text, marginBottom: 24 },
  infoCard: { backgroundColor: EV.bgCard, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: EV.border },
  infoTitle: { fontSize: 16, fontWeight: '800', color: EV.primary, marginBottom: 12 },
  infoText: { fontSize: 13, color: EV.textMuted, marginBottom: 6 },
  button: { backgroundColor: EV.bgCard, borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: EV.border },
  buttonPrimary: { backgroundColor: EV.primary, borderColor: EV.primary },
  buttonDanger: { backgroundColor: EV.danger, borderColor: EV.danger },
  buttonText: { color: EV.text, fontWeight: 'bold', fontSize: 15 },
});
