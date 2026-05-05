import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hello, Mark 👋</Text>
      <Text style={styles.subtitle}>Ready for an eco-friendly trip?</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌱 Your Eco Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>48kg</Text>
            <Text style={styles.statLabel}>CO₂ Saved</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>3.2</Text>
            <Text style={styles.statLabel}>Trees Saved</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/setup')}>
        <Text style={styles.primaryButtonText}>+ Plan New Trip</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Trips</Text>

      {[
        { from: 'Kuala Lumpur', to: 'Penang', date: 'Dec 10', score: 87 },
        { from: 'Johor Bahru', to: 'Melaka', date: 'Dec 5', score: 72 },
      ].map((trip, i) => (
        <View key={i} style={styles.tripCard}>
          <View>
            <Text style={styles.tripRoute}>{trip.from} → {trip.to}</Text>
            <Text style={styles.tripDate}>{trip.date}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{trip.score}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, paddingTop: 60 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#22c55e', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  primaryButton: { backgroundColor: '#22c55e', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 32 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  tripCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tripRoute: { color: '#fff', fontWeight: '600', fontSize: 15 },
  tripDate: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  scoreBadge: { backgroundColor: '#22c55e', borderRadius: 10, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scoreText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
