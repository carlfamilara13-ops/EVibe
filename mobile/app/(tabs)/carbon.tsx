import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NATURE as EV } from '@/constants/theme';
import { useCarbonData } from '@/hooks/useCarbonData';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// ── Eco Score helpers ─────────────────────────────────────────────────────────
const SCORE = { score: 78, budget: 85, carbon: 72, efficiency: 76 };
const HISTORY = [
  { id: '1', route: 'Home → Office', date: 'Jun 12', score: 82, distance: '12 km' },
  { id: '2', route: 'Home → Mall', date: 'Jun 8', score: 65, distance: '8 km' },
  { id: '3', route: 'Office → Park', date: 'Jun 3', score: 91, distance: '5 km' },
  { id: '4', route: 'Home → Airport', date: 'May 28', score: 55, distance: '34 km' },
];
const getStars = (s: number) => s >= 90 ? 5 : s >= 75 ? 4 : s >= 60 ? 3 : s >= 40 ? 2 : 1;
const getColor = (s: number) => s >= 75 ? EV.primary : s >= 50 ? EV.warning : EV.danger;
const getMsg = (s: number) => s >= 90 ? { title: 'Outstanding! 🏆', sub: "You're an eco champion!" }
  : s >= 75 ? { title: 'Great job! 🌟', sub: 'Keep up the green commuting!' }
  : s >= 60 ? { title: 'Good effort! 👍', sub: 'Room to improve your score.' }
  : { title: 'Keep going! 💪', sub: 'Try more green commutes.' };

export default function CarbonScreen() {
  const [tab, setTab] = useState<'carbon' | 'score'>('carbon');
  const { loading, error, carbonData, refetch } = useCarbonData();
  const router = useRouter();

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/login');
      }},
    ]);
  };

  const { score, budget, carbon, efficiency } = SCORE;
  const scoreColor = getColor(score);
  const stars = getStars(score);
  const msg = getMsg(score);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={EV.statusBar} backgroundColor={EV.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{tab === 'carbon' ? 'Carbon Footprint' : 'Eco Score'}</Text>
          <Text style={styles.headerSub}>{tab === 'carbon' ? 'Your environmental impact' : 'Your green commute rating'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={EV.danger} />
        </TouchableOpacity>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'carbon' && styles.tabBtnActive]} onPress={() => setTab('carbon')}>
          <Ionicons name="leaf-outline" size={15} color={tab === 'carbon' ? EV.white : EV.textMuted} />
          <Text style={[styles.tabBtnText, tab === 'carbon' && styles.tabBtnTextActive]}>Carbon</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'score' && styles.tabBtnActive]} onPress={() => setTab('score')}>
          <Ionicons name="star-outline" size={15} color={tab === 'score' ? EV.white : EV.textMuted} />
          <Text style={[styles.tabBtnText, tab === 'score' && styles.tabBtnTextActive]}>Eco Score</Text>
        </TouchableOpacity>
      </View>

      {/* ── CARBON TAB ── */}
      {tab === 'carbon' && (
        loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={EV.primary} />
            <Text style={styles.loadingText}>Loading carbon data...</Text>
          </View>
        ) : !carbonData ? (
          <View style={styles.center}>
            <Ionicons name="leaf-outline" size={64} color={EV.textDim} />
            <Text style={styles.emptyTitle}>No Carbon Data Yet</Text>
            <Text style={styles.emptyText}>Start a commute to see your footprint</Text>
            <TouchableOpacity style={styles.planBtn} onPress={() => router.push('/(tabs)' as any)}>
              <Ionicons name="map-outline" size={18} color={EV.white} />
              <Text style={styles.planBtnText}>Plan a Commute</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Hero */}
            <View style={styles.heroCard}>
              <View style={styles.heroGlow} />
              <Text style={styles.heroEyebrow}>CO₂ SAVED THIS TRIP</Text>
              <Text style={styles.heroNumber}>{(carbonData.savedKg || 0).toFixed(1)}</Text>
              <Text style={styles.heroUnit}>kilograms of CO₂</Text>
              <View style={styles.heroDivider} />
              <View style={styles.treesRow}>
                {[...Array(Math.min(Math.ceil(carbonData.treesEquivalent || 0), 5))].map((_, i) => (
                  <View key={i} style={[styles.treeIcon, { marginLeft: i > 0 ? -8 : 0 }]}>
                    <Ionicons name="leaf" size={13} color={EV.white} />
                  </View>
                ))}
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.treesNum}>{(carbonData.treesEquivalent || 0).toFixed(1)} trees equivalent</Text>
                  <Text style={styles.treesSub}>planted for a year</Text>
                </View>
              </View>
              <View style={styles.reductionBadge}>
                <Ionicons name="trending-down" size={14} color={EV.primary} />
                <Text style={styles.reductionText}>{(carbonData.savedPercentage || 0).toFixed(0)}% less than a gas car</Text>
              </View>
            </View>

            {/* Comparison */}
            <Text style={styles.sectionTitle}>EMISSIONS COMPARISON</Text>
            <View style={styles.compareCard}>
              {[
                { label: `Your ${carbonData.mode || 'commute'}`, val: carbonData.tripEmission || 0, color: EV.primary, pct: (carbonData.tripEmission || 0) / Math.max(carbonData.carEmission || 1, 1) },
                { label: 'Gas Car', val: carbonData.carEmission || 0, color: EV.danger, pct: 1 },
              ].map(b => (
                <View key={b.label} style={styles.barItem}>
                  <View style={styles.barLabelRow}>
                    <View style={[styles.barDot, { backgroundColor: b.color }]} />
                    <Text style={styles.barName}>{b.label}</Text>
                    <Text style={[styles.barKg, { color: b.color }]}>{b.val.toFixed(1)} kg</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${b.pct * 100}%` as any, backgroundColor: b.color }]} />
                  </View>
                </View>
              ))}
            </View>

            {/* Stats */}
            <Text style={styles.sectionTitle}>TRIP DETAILS</Text>
            <View style={styles.statsGrid}>
              {[
                { icon: 'speedometer-outline', label: 'Distance', value: `${(carbonData.distanceKm || 0).toFixed(1)} km`, color: EV.accent },
                { icon: 'trending-down-outline', label: 'Reduction', value: `${(carbonData.savedPercentage || 0).toFixed(0)}%`, color: EV.primary },
                { icon: 'flash-outline', label: 'Energy', value: carbonData.energyKwh ? `${carbonData.energyKwh.toFixed(1)} kWh` : 'N/A', color: EV.info },
                { icon: 'cloud-outline', label: 'Grid Factor', value: '0.233 kg/kWh', color: EV.textMuted },
              ].map(s => (
                <View key={s.label} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                    <Ionicons name={s.icon as any} size={18} color={s.color} />
                  </View>
                  <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLbl}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Impact */}
            <View style={styles.impactCard}>
              <Ionicons name="earth" size={28} color={EV.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.impactTitle}>You're making a difference 🌍</Text>
                <Text style={styles.impactText}>
                  By commuting green, you saved {(carbonData.savedKg || 0).toFixed(1)} kg CO₂ — equal to planting {(carbonData.treesEquivalent || 0).toFixed(1)} trees.
                </Text>
              </View>
            </View>
            <View style={{ height: 24 }} />
          </ScrollView>
        )
      )}

      {/* ── ECO SCORE TAB ── */}
      {tab === 'score' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Score hero */}
          <View style={styles.scoreHero}>
            <View style={[styles.scoreGlow, { backgroundColor: scoreColor + '12' }]} />
            <View style={styles.ringWrap}>
              <View style={[styles.ringOuter, { borderColor: scoreColor + '15' }]} />
              <View style={[styles.ringMid, { borderColor: scoreColor + '30' }]} />
              <View style={[styles.ringInner, { borderColor: scoreColor }]}>
                <Text style={[styles.ringNum, { color: scoreColor }]}>{score}</Text>
                <Text style={styles.ringOf}>/100</Text>
              </View>
            </View>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <Ionicons key={i} name={i <= stars ? 'star' : 'star-outline'} size={22} color={i <= stars ? EV.warning : EV.textDim} />
              ))}
            </View>
            <Text style={styles.msgTitle}>{msg.title}</Text>
            <Text style={styles.msgSub}>{msg.sub}</Text>
          </View>

          {/* Breakdown */}
          <Text style={styles.sectionTitle}>SCORE BREAKDOWN</Text>
          <View style={styles.metricsCard}>
            {[
              { label: 'Budget Score', value: budget, icon: 'wallet-outline', color: EV.warning, desc: 'Stayed within budget' },
              { label: 'Carbon Score', value: carbon, icon: 'leaf-outline', color: EV.primary, desc: 'Low emissions commute' },
              { label: 'Efficiency', value: efficiency, icon: 'flash-outline', color: EV.info, desc: 'Energy usage rating' },
            ].map((m, i, arr) => (
              <View key={m.label} style={[styles.metricRow, i < arr.length - 1 && styles.metricBorder]}>
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
              { icon: 'bus-outline', tip: 'Take public transport instead of driving', color: EV.primary, gain: '+8 pts' },
              { icon: 'wallet-outline', tip: 'Stay within your daily commute budget', color: EV.warning, gain: '+5 pts' },
              { icon: 'walk-outline', tip: 'Walk short distances under 1km', color: EV.accent, gain: '+6 pts' },
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

          {/* History */}
          <Text style={styles.sectionTitle}>TRIP HISTORY</Text>
          {HISTORY.map(trip => {
            const c = getColor(trip.score);
            const s = getStars(trip.score);
            return (
              <View key={trip.id} style={styles.historyCard}>
                <View style={[styles.historyScore, { borderColor: c + '60', backgroundColor: c + '12' }]}>
                  <Text style={[styles.historyScoreNum, { color: c }]}>{trip.score}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.historyRoute}>{trip.route}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={styles.historyMeta}>{trip.date}</Text>
                    <Text style={styles.historyMeta}>·</Text>
                    <Text style={styles.historyMeta}>{trip.distance}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1,2,3,4,5].map(i => (
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 40 },
  loadingText: { fontSize: 14, color: EV.textMuted, fontWeight: '600' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: EV.text },
  emptyText: { fontSize: 14, color: EV.textMuted, textAlign: 'center' },
  planBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: EV.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  planBtnText: { color: EV.white, fontWeight: '700', fontSize: 15 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: EV.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: EV.text },
  headerSub: { fontSize: 12, color: EV.textMuted, marginTop: 2 },
  logoutBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: EV.danger + '15', alignItems: 'center', justifyContent: 'center' },

  tabRow: { flexDirection: 'row', margin: 16, backgroundColor: EV.bgSurface, borderRadius: 14, padding: 4, gap: 4 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabBtnActive: { backgroundColor: EV.primary },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: EV.textMuted },
  tabBtnTextActive: { color: EV.white },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginHorizontal: 16, marginBottom: 12 },

  // Carbon
  heroCard: { margin: 16, backgroundColor: EV.bgCard, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: EV.border, overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: EV.primary + '10' },
  heroEyebrow: { fontSize: 11, color: EV.textMuted, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  heroNumber: { fontSize: 72, fontWeight: '900', color: EV.primary, letterSpacing: -3, lineHeight: 76 },
  heroUnit: { fontSize: 14, color: EV.textMuted, marginBottom: 20 },
  heroDivider: { width: 60, height: 2, backgroundColor: EV.border, marginBottom: 20 },
  treesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  treeIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: EV.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: EV.bgCard },
  treesNum: { fontSize: 15, fontWeight: '800', color: EV.text },
  treesSub: { fontSize: 11, color: EV.textMuted },
  reductionBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: EV.primary + '18', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: EV.border },
  reductionText: { fontSize: 13, color: EV.primary, fontWeight: '700' },

  compareCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: EV.bgCard, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: EV.border, gap: 16 },
  barItem: { gap: 8 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barDot: { width: 8, height: 8, borderRadius: 4 },
  barName: { flex: 1, fontSize: 13, color: EV.textMuted, fontWeight: '600' },
  barKg: { fontSize: 13, fontWeight: '800' },
  barTrack: { height: 10, backgroundColor: EV.bgSurface, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 10, marginBottom: 16 },
  statCard: { width: (width - 44) / 2, backgroundColor: EV.bgCard, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: EV.border },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 15, fontWeight: '800' },
  statLbl: { fontSize: 11, color: EV.textMuted },

  impactCard: { flexDirection: 'row', gap: 14, marginHorizontal: 16, backgroundColor: EV.bgCard, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: EV.border, alignItems: 'flex-start' },
  impactTitle: { fontSize: 15, fontWeight: '800', color: EV.text, marginBottom: 6 },
  impactText: { fontSize: 13, color: EV.textMuted, lineHeight: 20 },

  // Score
  scoreHero: { margin: 16, backgroundColor: EV.bgCard, borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: EV.border, overflow: 'hidden' },
  scoreGlow: { position: 'absolute', top: -80, width: 300, height: 300, borderRadius: 150 },
  ringWrap: { alignItems: 'center', justifyContent: 'center', width: 160, height: 160, marginBottom: 20 },
  ringOuter: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 16 },
  ringMid: { position: 'absolute', width: 136, height: 136, borderRadius: 68, borderWidth: 8 },
  ringInner: { width: 112, height: 112, borderRadius: 56, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  ringNum: { fontSize: 42, fontWeight: '900', lineHeight: 46 },
  ringOf: { fontSize: 13, color: EV.textMuted, fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  msgTitle: { fontSize: 22, fontWeight: '800', color: EV.text, marginBottom: 4 },
  msgSub: { fontSize: 14, color: EV.textMuted },

  metricsCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: EV.bgCard, borderRadius: 20, borderWidth: 1, borderColor: EV.border, overflow: 'hidden' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  metricBorder: { borderBottomWidth: 1, borderBottomColor: EV.border },
  metricIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  metricInfo: { flex: 1, gap: 8 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  metricLabel: { fontSize: 14, fontWeight: '700', color: EV.text },
  metricDesc: { fontSize: 11, color: EV.textDim, marginTop: 2 },
  metricVal: { fontSize: 22, fontWeight: '900' },
  metricTrack: { height: 6, backgroundColor: EV.bgSurface, borderRadius: 3, overflow: 'hidden' },
  metricFill: { height: '100%', borderRadius: 3 },

  tipsCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: EV.bgCard, borderRadius: 20, borderWidth: 1, borderColor: EV.border, overflow: 'hidden' },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: EV.border },
  tipIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, fontSize: 13, color: EV.textMuted, lineHeight: 18 },
  gainBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  gainText: { fontSize: 11, fontWeight: '800' },

  historyCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, marginBottom: 8, backgroundColor: EV.bgCard, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: EV.border },
  historyScore: { width: 54, height: 54, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  historyScoreNum: { fontSize: 20, fontWeight: '900' },
  historyRoute: { fontSize: 14, fontWeight: '700', color: EV.text },
  historyMeta: { fontSize: 12, color: EV.textMuted },
});
