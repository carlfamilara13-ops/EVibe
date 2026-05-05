import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';

const TRIP = { origin: 'Manila', destination: 'Quezon City', distance: '15 km', budget: 500, spent: 280 };
const EXPENSES = [
  { category: 'Charging', icon: 'flash', amount: 120, desc: 'GreenCharge Hub', color: EV.primary },
  { category: 'Food', icon: 'restaurant', amount: 95, desc: 'Lunch stop', color: EV.warning },
  { category: 'Stay', icon: 'bed', amount: 65, desc: 'Hotel near destination', color: EV.info },
];
const progress = TRIP.spent / TRIP.budget;
const progressColor = progress > 0.85 ? EV.danger : progress > 0.6 ? EV.warning : EV.primary;

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={EV.textMuted} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{TRIP.origin} → {TRIP.destination}</Text>
          <Text style={styles.headerSub}>{TRIP.distance} · Active Trip</Text>
        </View>
        <View style={styles.activePill}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Live</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Budget card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: EV.primary + '20' }]}>
              <Ionicons name="wallet" size={18} color={EV.primary} />
            </View>
            <Text style={styles.cardTitle}>Budget Tracker</Text>
          </View>
          <View style={styles.budgetRow}>
            <View>
              <Text style={styles.budgetLabel}>SPENT</Text>
              <Text style={[styles.budgetSpent, { color: progressColor }]}>₱{TRIP.spent}</Text>
            </View>
            <View style={styles.budgetRight}>
              <Text style={styles.budgetLabel}>REMAINING</Text>
              <Text style={styles.budgetRemain}>₱{TRIP.budget - TRIP.spent}</Text>
            </View>
            <View style={styles.budgetRight}>
              <Text style={styles.budgetLabel}>BUDGET</Text>
              <Text style={styles.budgetTotal}>₱{TRIP.budget}</Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: progressColor }]} />
          </View>
          <Text style={styles.progressPct}>{Math.round(progress * 100)}% used</Text>
        </View>

        {/* Eco score card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: EV.neon + '20' }]}>
              <Ionicons name="leaf" size={18} color={EV.neon} />
            </View>
            <Text style={styles.cardTitle}>Eco Score</Text>
          </View>
          <View style={styles.ecoRow}>
            <View style={styles.scoreRing}>
              <Text style={styles.scoreNum}>87</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <View style={styles.ecoRight}>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name={i <= 4 ? 'star' : 'star-outline'} size={16} color={i <= 4 ? EV.warning : EV.textDim} />
                ))}
              </View>
              <Text style={styles.ecoMsg}>Great eco-friendly trip! 🌿</Text>
              <View style={styles.carbonStats}>
                <View style={styles.carbonStat}>
                  <Text style={styles.carbonVal}>12.4 kg</Text>
                  <Text style={styles.carbonLbl}>CO₂ Saved</Text>
                </View>
                <View style={styles.carbonStat}>
                  <Text style={styles.carbonVal}>0.8</Text>
                  <Text style={styles.carbonLbl}>Trees</Text>
                </View>
                <View style={styles.carbonStat}>
                  <Text style={styles.carbonVal}>2.1 kg</Text>
                  <Text style={styles.carbonLbl}>Emitted</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Expenses */}
        <View style={styles.expenseHeader}>
          <Text style={styles.sectionTitle}>EXPENSES</Text>
          <TouchableOpacity style={styles.addExpBtn} onPress={() => router.push('/add-expense')}>
            <Ionicons name="add" size={16} color={EV.bg} />
            <Text style={styles.addExpText}>Add</Text>
          </TouchableOpacity>
        </View>

        {EXPENSES.map((e, i) => (
          <View key={i} style={styles.expenseCard}>
            <View style={[styles.expIcon, { backgroundColor: e.color + '20' }]}>
              <Ionicons name={e.icon as any} size={18} color={e.color} />
            </View>
            <View style={styles.expInfo}>
              <Text style={styles.expCategory}>{e.category}</Text>
              <Text style={styles.expDesc}>{e.desc}</Text>
            </View>
            <Text style={[styles.expAmount, { color: e.color }]}>₱{e.amount}</Text>
          </View>
        ))}

        {/* Eco tips button */}
        <TouchableOpacity style={styles.tipsBtn} onPress={() => router.push('/tips')}>
          <Ionicons name="bulb-outline" size={18} color={EV.primary} />
          <Text style={styles.tipsBtnText}>View Eco Tips</Text>
          <Ionicons name="chevron-forward" size={16} color={EV.primary} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: EV.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: EV.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: EV.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: EV.text },
  headerSub: { fontSize: 12, color: EV.textMuted, marginTop: 2 },
  activePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: EV.primary + '20', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: EV.primaryDark, marginLeft: 'auto' as any,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: EV.primary },
  activeText: { fontSize: 11, color: EV.primary, fontWeight: '700' },
  scroll: { padding: 16 },
  card: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: EV.border, marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: EV.text },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  budgetLabel: { fontSize: 9, color: EV.textDim, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  budgetSpent: { fontSize: 28, fontWeight: '900' },
  budgetRight: {},
  budgetRemain: { fontSize: 18, fontWeight: '800', color: EV.primary },
  budgetTotal: { fontSize: 18, fontWeight: '800', color: EV.textMuted },
  progressBg: { height: 8, backgroundColor: EV.bgSurface, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 11, color: EV.textMuted },
  ecoRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreRing: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: EV.primary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: EV.bgSurface,
  },
  scoreNum: { fontSize: 26, fontWeight: '900', color: EV.primary },
  scoreMax: { fontSize: 10, color: EV.textMuted },
  ecoRight: { flex: 1, gap: 8 },
  starsRow: { flexDirection: 'row', gap: 3 },
  ecoMsg: { fontSize: 13, color: EV.textMuted },
  carbonStats: { flexDirection: 'row', gap: 16 },
  carbonStat: {},
  carbonVal: { fontSize: 13, fontWeight: '700', color: EV.text },
  carbonLbl: { fontSize: 10, color: EV.textMuted },
  expenseHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: EV.primary, letterSpacing: 1.5 },
  addExpBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: EV.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  addExpText: { fontSize: 13, fontWeight: '700', color: EV.bg },
  expenseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: EV.bgCard, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: EV.border, marginBottom: 10,
  },
  expIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expInfo: { flex: 1 },
  expCategory: { fontSize: 14, fontWeight: '700', color: EV.text },
  expDesc: { fontSize: 12, color: EV.textMuted, marginTop: 2 },
  expAmount: { fontSize: 16, fontWeight: '800' },
  tipsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: EV.bgCard, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: EV.primaryDark, marginTop: 4,
  },
  tipsBtnText: { flex: 1, fontSize: 15, fontWeight: '700', color: EV.primary },
});
