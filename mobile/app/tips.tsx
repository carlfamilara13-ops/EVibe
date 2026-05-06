import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';

const TIPS = [
  { icon: 'flash', title: 'Charge at Off-Peak Hours', desc: 'Charging between 10pm–6am is cheaper and reduces grid strain.', color: EV.primary, gain: '+8 pts' },
  { icon: 'speedometer', title: 'Maintain Steady Speed', desc: 'Driving at 90 km/h instead of 120 km/h can extend range by up to 30%.', color: EV.accent, gain: '+6 pts' },
  { icon: 'thermometer', title: 'Pre-condition Your Car', desc: 'Cool or heat your car while still plugged in to save battery on the road.', color: EV.info, gain: '+4 pts' },
  { icon: 'map', title: 'Plan Charging Stops', desc: 'Charge to 80% for faster charging speeds and better battery health.', color: EV.warning, gain: '+5 pts' },
  { icon: 'refresh', title: 'Use Regenerative Braking', desc: 'Anticipate stops early and let regen braking recover energy.', color: EV.neon, gain: '+7 pts' },
  { icon: 'leaf', title: 'Every Trip Counts', desc: 'Your EV saves an average of 1.5 tonnes of CO₂ per year vs a gas car.', color: EV.primaryDeep, gain: '+3 pts' },
];

export default function TipsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={EV.textMuted} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Eco Tips</Text>
          <Text style={styles.headerSub}>Small changes, big impact</Text>
        </View>
        <View style={styles.leafBadge}>
          <Ionicons name="leaf" size={16} color={EV.bg} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Ionicons name="earth" size={36} color={EV.primary} />
          <Text style={styles.heroTitle}>Drive Greener Today</Text>
          <Text style={styles.heroSub}>Follow these tips to boost your Eco Score and reduce your carbon footprint</Text>
        </View>

        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
              <Ionicons name={tip.icon as any} size={22} color={tip.color} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
            <View style={[styles.gainBadge, { backgroundColor: tip.color + '20', borderColor: tip.color + '40' }]}>
              <Text style={[styles.gainText, { color: tip.color }]}>{tip.gain}</Text>
            </View>
          </View>
        ))}

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
  headerTitle: { fontSize: 18, fontWeight: '800', color: EV.text },
  headerSub: { fontSize: 12, color: EV.textMuted, marginTop: 2 },
  leafBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: EV.primary, alignItems: 'center', justifyContent: 'center',
    marginLeft: 'auto' as any,
  },
  scroll: { padding: 16 },
  heroCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 10, marginBottom: 20,
    borderWidth: 1, borderColor: EV.primaryDark, overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -40, width: 200, height: 200, borderRadius: 100,
    backgroundColor: EV.primary + '12',
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: EV.text },
  heroSub: { fontSize: 13, color: EV.textMuted, textAlign: 'center', lineHeight: 20 },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: EV.bgCard, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: EV.border, marginBottom: 10,
  },
  tipIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: EV.text, marginBottom: 4 },
  tipDesc: { fontSize: 13, color: EV.textMuted, lineHeight: 19 },
  gainBadge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start',
  },
  gainText: { fontSize: 11, fontWeight: '800' },
});
