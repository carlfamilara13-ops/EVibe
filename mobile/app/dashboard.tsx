import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const budget = 200;
  const spent = 120;
  const progress = spent / budget;

  const expenses = [
    { category: '⚡ Charging', amount: 45, desc: 'Shell Recharge Penang' },
    { category: '🍔 Food', amount: 35, desc: 'Lunch at R&R' },
    { category: '🏨 Stay', amount: 40, desc: 'Hotel near destination' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>KL → Penang</Text>
      <Text style={styles.subtitle}>370 km • Active Trip</Text>

      {/* Budget Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Budget Tracker</Text>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetSpent}>RM {spent}</Text>
          <Text style={styles.budgetTotal}>/ RM {budget}</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
        <Text style={styles.budgetRemaining}>RM {budget - spent} remaining</Text>
      </View>

      {/* Eco Score */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌿 Eco Score</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>87</Text>
          <View>
            <Text style={styles.stars}>⭐⭐⭐⭐☆</Text>
            <Text style={styles.scoreMsg}>Great eco-friendly trip!</Text>
          </View>
        </View>
        <View style={styles.carbonRow}>
          <View style={styles.carbonStat}>
            <Text style={styles.carbonValue}>12.4 kg</Text>
            <Text style={styles.carbonLabel}>CO₂ Saved</Text>
          </View>
          <View style={styles.carbonStat}>
            <Text style={styles.carbonValue}>0.8</Text>
            <Text style={styles.carbonLabel}>Trees Saved</Text>
          </View>
          <View style={styles.carbonStat}>
            <Text style={styles.carbonValue}>2.1 kg</Text>
            <Text style={styles.carbonLabel}>CO₂ Emitted</Text>
          </View>
        </View>
      </View>

      {/* Expenses */}
      <View style={styles.expenseHeader}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        <TouchableOpacity onPress={() => router.push('/add-expense')}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {expenses.map((e, i) => (
        <View key={i} style={styles.expenseCard}>
          <View>
            <Text style={styles.expenseCategory}>{e.category}</Text>
            <Text style={styles.expenseDesc}>{e.desc}</Text>
          </View>
          <Text style={styles.expenseAmount}>RM {e.amount}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.tipsBtn} onPress={() => router.push('/tips')}>
        <Text style={styles.tipsBtnText}>🌱 View Eco Tips</Text>
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
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#22c55e', marginBottom: 14 },
  budgetRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  budgetSpent: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  budgetTotal: { fontSize: 16, color: '#94a3b8', marginLeft: 6 },
  progressBg: { backgroundColor: '#0f172a', borderRadius: 8, height: 10, marginBottom: 8 },
  progressFill: { backgroundColor: '#22c55e', borderRadius: 8, height: 10 },
  budgetRemaining: { color: '#94a3b8', fontSize: 13 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  scoreValue: { fontSize: 52, fontWeight: 'bold', color: '#22c55e' },
  stars: { fontSize: 18, marginBottom: 4 },
  scoreMsg: { color: '#94a3b8', fontSize: 13 },
  carbonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  carbonStat: { alignItems: 'center' },
  carbonValue: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  carbonLabel: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  expenseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  addBtn: { color: '#22c55e', fontWeight: 'bold', fontSize: 15 },
  expenseCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  expenseCategory: { color: '#fff', fontWeight: '600', fontSize: 14 },
  expenseDesc: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  expenseAmount: { color: '#22c55e', fontWeight: 'bold', fontSize: 16 },
  tipsBtn: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 32, borderWidth: 1, borderColor: '#22c55e' },
  tipsBtnText: { color: '#22c55e', fontWeight: 'bold', fontSize: 15 },
});
