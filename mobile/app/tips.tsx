import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const TIPS = [
  { icon: '⚡', title: 'Charge at Off-Peak Hours', desc: 'Charging between 10pm–6am is cheaper and reduces grid strain.' },
  { icon: '🚗', title: 'Maintain Steady Speed', desc: 'Driving at 90 km/h instead of 120 km/h can extend range by up to 30%.' },
  { icon: '❄️', title: 'Pre-condition Your Car', desc: 'Cool or heat your car while still plugged in to save battery on the road.' },
  { icon: '🛣️', title: 'Plan Charging Stops', desc: 'Charge to 80% for faster charging speeds and better battery health.' },
  { icon: '🌬️', title: 'Use Regenerative Braking', desc: 'Anticipate stops early and let regen braking recover energy.' },
  { icon: '🌳', title: 'Every Trip Counts', desc: 'Your EV saves an average of 1.5 tonnes of CO₂ per year vs a gas car.' },
];

export default function TipsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Eco Tips 🌱</Text>
      <Text style={styles.subtitle}>Small changes, big impact</Text>

      {TIPS.map((tip, i) => (
        <View key={i} style={styles.tipCard}>
          <Text style={styles.tipIcon}>{tip.icon}</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDesc}>{tip.desc}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#22c55e', fontSize: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 28 },
  tipCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 14 },
  tipIcon: { fontSize: 28 },
  tipContent: { flex: 1 },
  tipTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  tipDesc: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
});
