import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SetupScreen() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Plan Your Trip</Text>
      <Text style={styles.subtitle}>Enter your trip details below</Text>

      <Text style={styles.label}>Starting Point</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Kuala Lumpur"
        placeholderTextColor="#64748b"
        value={origin}
        onChangeText={setOrigin}
      />

      <Text style={styles.label}>Destination</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Penang"
        placeholderTextColor="#64748b"
        value={destination}
        onChangeText={setDestination}
      />

      <Text style={styles.label}>Trip Budget (RM)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 200"
        placeholderTextColor="#64748b"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📍 Estimated Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Distance</Text>
          <Text style={styles.infoValue}>-- km</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Battery Usage</Text>
          <Text style={styles.infoValue}>-- %</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Charging Stops</Text>
          <Text style={styles.infoValue}>--</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/dashboard')}>
        <Text style={styles.buttonText}>Start Trip →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#22c55e', fontSize: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 28 },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: '#1e293b', color: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 15 },
  infoCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 24, marginTop: 8 },
  infoTitle: { color: '#22c55e', fontWeight: 'bold', fontSize: 15, marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { color: '#94a3b8', fontSize: 14 },
  infoValue: { color: '#fff', fontWeight: '600', fontSize: 14 },
  button: { backgroundColor: '#22c55e', borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
