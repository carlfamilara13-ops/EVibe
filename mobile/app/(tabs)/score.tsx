import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, Dimensions, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NATURE as EV } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const CURRENT = { score: 78, budget: 85, carbon: 72, efficiency: 76 };

const HISTORY = [
  { id: '1', route: 'City → Beach', date: 'Jun 12', score: 82, stars: 4, distance: '98 km' },
  { id: '2', route: 'Home → Airport', date: 'Jun 8', score: 65, stars: 3, distance: '34 km' },
  { id: '3', route: 'Downtown → Mall', date: 'Jun 3', score: 91, stars: 5, distance: '12 km' },
  { id: '4', route: 'Office → Park', date: 'May 28', score: 55, stars: 3, distance: '22 km' },
];

function getStars(score: number) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

function getScoreColor(score: number) {
  if (score >= 75) return EV.primary;
  if (score >= 50) return EV.warning;
  return EV.danger;
}

function getMessage(score: number) {
  if (score >= 90) return { title: 'Outstanding! 🏆', sub: "You're an eco champion!" };
  if (score >= 75) return { title: 'Great job! 🌟', sub: 'Keep up the green driving!' };
  if (score >= 60) return { title: 'Good effort! 👍', sub: 'Room to improve your score.' };
  if (score >= 40) return { title: 'Keep improving! 💪', sub: 'Try optimizing your route.' };
  return { title: "Let's do better! 🌱", sub: 'Check your budget & carbon tips.' };
}

export default function ScoreScreen() {
  const router = useRouter();
  const { score, budget, carbon, efficiency } = CURRENT;
  const color = getScoreColor(score);
  const stars = getStars(score);
  const msg = getMessage(score);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/login');
      }},
    ]);
  };

  const metrics = [
    { label: 'Budget Score', value: budget, icon: 'wallet-outline', color: EV.accent, desc: 'Stayed within budget' },
    { label: 'Carbon Score', value: carbon, icon: 'leaf-outline', color: EV.primary, desc: 'Low emissions trip' },
    { label: 'Efficiency', value: efficiency, icon: 'flash-outline', color: EV.neon, desc: 'Energy usage rating' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Eco Score</Text>
          <Text style={styles.headerSub}>Your green driving rating</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View style={[styles.starBadge, { backgroundColor: EV.warning }]}>
            <Ionicons name="star" size={14} color={EV.bg} />
            <Text style={styles.starBadgeText}>{stars}/5</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={EV.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Score hero */}
        <View style={styles.heroCard}>
          <View style={[styles.heroGlow, { backgroundColor: color + '12' }]} />

          {/* Ring */}
          <View style={styles.ringContainer}>
            {/* Outer decorative ring */}
            <View style={[styles.ringDecor, { borderColor: color + '15' }]} />
            {/* Middle ring */}
            <View style={[styles.ringMiddle, { borderColor: color + '30' }]} />
            {/* Main ring */}
            <View style={[styles.ringMain, { borderColor: color }]}>
              <Text style={[styles.ringScore, { color }]}>{score}</Text>
              <Text style={styles.ringDivider}>/100</Text>
            </View>
          </View>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons
                key={i}
                name={i <= stars ? 'star' : 'star-outline'}
                size={22}
                color={i <= stars ? EV.warning : EV.textDim}
              />
            ))}
          </View>

          <Text style={styles.msgTitle}>{msg.title}</Text>
          <Text style={styles.msgSub}>{msg.sub}</Text>
        </View>

        {/* Score breakdown */}
        <Text style={styles.sectionTitle}>SCORE BREAKDOWN</Text>
        <View style={styles.metricsCard}>
          {metrics.map((m, i) => (
            <View key={m.label} style={[styles.metricRow, i < metrics.length - 1 && styles.metricDivider]}>
              <View style={[styles.metricIcon, { backgroundColor: m.color + '18' }]}>
                <Ionicons name={m.icon as any} size={20} color={m.color} />
              </View>
              <View style={styles.metricInfo}>
                <View style={styles.metricTop}>
                  <View>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                    <Text style={styles.metricDesc}>{m.desc}</Text>
                  </View>
                  <Text style={[styles.metricVal, { color: m.color }]}>{m.value}</Text>
                </View>
                <View style={styles.metricTrack}>
                  <View style={[styles.metricFill, { width: `${m.value}%` as any, backgroundColor: m.color }]} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Tips */}
        <Text style={styles.sectionTitle}>TIPS TO IMPROVE</Text>
        <View style={styles.tipsCard}>
          {[
            { icon: 'flash', tip: 'Charge at off-peak hours to reduce grid emissions', color: EV.primary, gain: '+8 pts' },
            { icon: 'wallet', tip: 'Stay within your daily budget to boost budget score', color: EV.accent, gain: '+5 pts' },
            { icon: 'speedometer', tip: 'Drive at steady speed for better energy efficiency', color: EV.neon, gain: '+6 pts' },
          ].map((t, i) => (
            <View key={i} style={[styles.tipRow, i < 2 && styles.tipBorder]}>
              <View style={[styles.tipIcon, { backgroundColor: t.color + '18' }]}>
                <Ionicons name={t.icon as any} size={16} color={t.color} />
              </View>
              <Text style={styles.tipText}>{t.tip}</Text>
              <View style={[styles.gainBadge, { backgroundColor: t.color + '18', borderColor: t.color + '40' }]}>
                <Text style={[styles.gainText, { color: t.color }]}>{t.gain}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Trip history */}
        <Text style={styles.sectionTitle}>TRIP HISTORY</Text>
        {HISTORY.map(trip => {
          const c = getScoreColor(trip.score);
          const s = getStars(trip.score);
          return (
            <View key={trip.id} style={styles.historyCard}>
              <View style={[styles.historyScore, { borderColor: c + '60', backgroundColor: c + '12' }]}>
                <Text style={[styles.historyScoreNum, { color: c }]}>{trip.score}</Text>
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyRoute}>{trip.route}</Text>
                <View style={styles.historyMeta}>
                  <Text style={styles.historyDate}>{trip.date}</Text>
                  <Text style={styles.historyDot}>·</Text>
                  <Text style={styles.historyDist}>{trip.distance}</Text>
                </View>
                <View style={styles.historyStars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Ionicons key={i} name={i <= s ? 'star' : 'star-outline'} size={11} color={i <= s ? EV.warning : EV.textDim} />
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={EV.textDim} />
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: EV.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: EV.text },
  headerSub: { fontSize: 12, color: EV.textMuted, marginTop: 2 },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  starBadgeText: { fontSize: 13, fontWeight: '800', color: EV.bg },
  logoutBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: EV.danger + '20', alignItems: 'center', justifyContent: 'center' },

  heroCard: {
    margin: 16,
    backgroundColor: EV.bgCard,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: EV.border,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
  },

  ringContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 20, width: 160, height: 160 },
  ringDecor: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 16,
  },
  ringMiddle: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 8,
  },
  ringMain: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: { fontSize: 42, fontWeight: '900', lineHeight: 46 },
  ringDivider: { fontSize: 13, color: EV.textMuted, fontWeight: '600' },

  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  msgTitle: { fontSize: 22, fontWeight: '800', color: EV.text, marginBottom: 4 },
  msgSub: { fontSize: 14, color: EV.textMuted },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: EV.primary,
    letterSpacing: 1.5,
    marginHorizontal: 16,
    marginBottom: 12,
  },

  metricsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: EV.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: EV.border,
    overflow: 'hidden',
  },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  metricDivider: { borderBottomWidth: 1, borderBottomColor: EV.border },
  metricIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  metricInfo: { flex: 1, gap: 8 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  metricLabel: { fontSize: 14, fontWeight: '700', color: EV.text },
  metricDesc: { fontSize: 11, color: EV.textDim, marginTop: 2 },
  metricVal: { fontSize: 22, fontWeight: '900' },
  metricTrack: { height: 6, backgroundColor: EV.bgSurface, borderRadius: 3, overflow: 'hidden' },
  metricFill: { height: '100%', borderRadius: 3 },

  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: EV.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: EV.border,
    overflow: 'hidden',
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: EV.border },
  tipIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, fontSize: 13, color: EV.textMuted, lineHeight: 18 },
  gainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  gainText: { fontSize: 11, fontWeight: '800' },

  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: EV.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: EV.border,
  },
  historyScore: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyScoreNum: { fontSize: 20, fontWeight: '900' },
  historyInfo: { flex: 1, gap: 3 },
  historyRoute: { fontSize: 14, fontWeight: '700', color: EV.text },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyDate: { fontSize: 12, color: EV.textMuted },
  historyDot: { fontSize: 12, color: EV.textDim },
  historyDist: { fontSize: 12, color: EV.textMuted },
  historyStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
});
