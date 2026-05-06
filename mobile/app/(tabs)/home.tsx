import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, ActivityIndicator, Animated, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NATURE as EV } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getIncomes, getUserExpenses, getTrips } from '@/services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');
const MONTH = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });
const MONTHLY_GOAL = 20; // target commutes per month

const SIMULATED_TRIPS = [
  {
    _id: 'sim-1',
    origin: 'City Square',
    destination: 'Central Park',
    distanceKm: 2.8,
    mode: 'walking',
    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    durationMin: 14,
    carbonKg: 0.1,
    steps: [{ label: 'Walk', icon: 'walk-outline', type: 'walk', cost: 0 }],
  },
  {
    _id: 'sim-2',
    origin: 'Main St',
    destination: 'Tech Hub',
    distanceKm: 5.4,
    mode: 'bus',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    durationMin: 22,
    carbonKg: 0.8,
    steps: [{ label: 'Bus', icon: 'bus-outline', type: 'bus', cost: 15 }],
  },
  {
    _id: 'sim-3',
    origin: 'Riverfront',
    destination: 'Market',
    distanceKm: 4.1,
    mode: 'ev',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    durationMin: 18,
    carbonKg: 0.5,
    steps: [{ label: 'EV ride', icon: 'flash-outline', type: 'ev', cost: 25 }],
  },
  {
    _id: 'sim-4',
    origin: 'Downtown',
    destination: 'Airport',
    distanceKm: 12.3,
    mode: 'bus',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    durationMin: 45,
    carbonKg: 1.2,
    steps: [{ label: 'Express Bus', icon: 'bus-outline', type: 'bus', cost: 35 }],
  },
  {
    _id: 'sim-5',
    origin: 'Park Ave',
    destination: 'Shopping Mall',
    distanceKm: 3.7,
    mode: 'biking',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    durationMin: 16,
    carbonKg: 0.0,
    steps: [{ label: 'Bike', icon: 'bicycle-outline', type: 'bike', cost: 0 }],
  },
  {
    _id: 'sim-6',
    origin: 'Library',
    destination: 'Gym',
    distanceKm: 1.9,
    mode: 'walking',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    durationMin: 12,
    carbonKg: 0.0,
    steps: [{ label: 'Walk', icon: 'walk-outline', type: 'walk', cost: 0 }],
  },
];

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

// Animated SVG progress circle
function ProgressCircle({ progress, size = 130, strokeWidth = 10, color = EV.primary, children }: {
  progress: number; size?: number; strokeWidth?: number; color?: string; children?: React.ReactNode;
}) {
  const animVal = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [strokeDash, setStrokeDash] = useState(circumference);

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    animVal.addListener(({ value }) => {
      setStrokeDash(circumference * (1 - value));
    });
    return () => animVal.removeAllListeners();
  }, [progress]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color + '20'} strokeWidth={strokeWidth} fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [showAllTrips, setShowAllTrips] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const u = userStr ? JSON.parse(userStr) : null;
      setUser(u);
      if (!u?.id) return;
      const [incRes, expRes, tripRes] = await Promise.all([
        getIncomes(u.id),
        getUserExpenses(u.id),
        getTrips(u.id),
      ]);
      setIncomes(incRes.data);
      setExpenses(expRes.data);
      setTrips(tripRes.data);
    } catch { }
    finally { setLoading(false); }
  };

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  const totalCO2Saved = trips.reduce((s, t) => s + (t.carbonKg || 0), 0);
  const totalDistance = trips.reduce((s, t) => s + (t.distanceKm || 0), 0);
  const balanceColor = balance < 0 ? EV.danger : balance < totalIncome * 0.2 ? EV.warning : EV.primary;

  // Progress data
  const routeProgress = Math.min(trips.length / MONTHLY_GOAL, 1);
  const co2Goal = 5; // kg target saved
  const co2Progress = Math.min(totalCO2Saved / co2Goal, 1);
  const budgetProgress = totalIncome > 0 ? Math.min(1 - totalExpenses / totalIncome, 1) : 0;

  const placeholderTrips = trips.length > 0 && trips.length < 4
    ? SIMULATED_TRIPS.slice(0, 4 - trips.length)
    : [];
  const displayedTrips = showAllTrips
    ? [...trips, ...placeholderTrips]
    : [...trips.slice(0, 3), ...placeholderTrips.slice(0, Math.max(0, 3 - trips.length))];
  const hasMoreActivity = trips.length > 3 || placeholderTrips.length > 0;

  const quickActions = [
    { icon: 'map-outline', label: 'Plan Route', color: EV.primary, route: '/(tabs)' },
    { icon: 'flash-outline', label: 'Stations', color: EV.info, route: '/(tabs)/stations' },
    { icon: 'wallet-outline', label: 'Budget', color: EV.warning, route: '/(tabs)/budget' },
    { icon: 'leaf-outline', label: 'Carbon', color: EV.accent, route: '/(tabs)/carbon' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}><ActivityIndicator size="large" color={EV.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={EV.statusBar} backgroundColor={EV.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{GREETING()},</Text>
            <Text style={styles.userName}>{user?.name || 'Commuter'} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/score' as any)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.monthRow}>
          <Ionicons name="calendar-outline" size={14} color={EV.textMuted} />
          <Text style={styles.monthText}>{MONTH} Overview</Text>
        </View>

        {/* ── PROGRESS CIRCLES CARD ── */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>THIS MONTH'S PROGRESS</Text>

          <View style={styles.circlesRow}>
            {/* Routes circle — main/large */}
            <View style={styles.mainCircleWrap}>
              <ProgressCircle progress={routeProgress} size={140} strokeWidth={12} color={EV.primary}>
                <View style={styles.circleCenter}>
                  <Text style={styles.circleBigNum}>{trips.length}</Text>
                  <Text style={styles.circleBigLabel}>routes</Text>
                  <Text style={styles.circleGoal}>of {MONTHLY_GOAL} goal</Text>
                </View>
              </ProgressCircle>
              <Text style={styles.circleTitle}>🚌 Commutes</Text>
              <View style={[styles.progressBar, { backgroundColor: EV.border }]}>
                <View style={[styles.progressFill, { width: `${routeProgress * 100}%` as any, backgroundColor: EV.primary }]} />
              </View>
              <Text style={styles.progressPct}>{Math.round(routeProgress * 100)}% of monthly goal</Text>
            </View>

            {/* Right side — 2 smaller circles */}
            <View style={styles.smallCirclesCol}>
              {/* CO2 */}
              <View style={styles.smallCircleWrap}>
                <ProgressCircle progress={co2Progress} size={90} strokeWidth={8} color={EV.accent}>
                  <View style={styles.circleCenter}>
                    <Text style={styles.circleSmallNum}>{totalCO2Saved.toFixed(1)}</Text>
                    <Text style={styles.circleSmallUnit}>kg</Text>
                  </View>
                </ProgressCircle>
                <Text style={styles.smallCircleLabel}>🌿 CO₂ Saved</Text>
              </View>

              {/* Budget */}
              <View style={styles.smallCircleWrap}>
                <ProgressCircle progress={budgetProgress} size={90} strokeWidth={8} color={EV.info}>
                  <View style={styles.circleCenter}>
                    <Text style={styles.circleSmallNum}>{Math.round(budgetProgress * 100)}</Text>
                    <Text style={styles.circleSmallUnit}>%</Text>
                  </View>
                </ProgressCircle>
                <Text style={styles.smallCircleLabel}>💰 Saved</Text>
              </View>
            </View>
          </View>

          {/* Distance strip */}
          <View style={styles.distanceStrip}>
            <Ionicons name="navigate-outline" size={16} color={EV.primary} />
            <Text style={styles.distanceText}>Total distance this month</Text>
            <Text style={[styles.distanceValue, { color: EV.primary }]}>{totalDistance.toFixed(1)} km</Text>
          </View>
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceLeft}>
            <Text style={styles.balanceLabel}>BALANCE</Text>
            <Text style={[styles.balanceAmount, { color: balanceColor }]}>
              ₱{balance.toLocaleString('en', { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceRight}>
            <View style={styles.balanceItem}>
              <Ionicons name="arrow-down-circle" size={14} color={EV.primary} />
              <Text style={styles.balanceItemLabel}>Income</Text>
              <Text style={[styles.balanceItemVal, { color: EV.primary }]}>₱{totalIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Ionicons name="arrow-up-circle" size={14} color={EV.danger} />
              <Text style={styles.balanceItemLabel}>Spent</Text>
              <Text style={[styles.balanceItemVal, { color: EV.danger }]}>₱{totalExpenses.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, { borderColor: a.color + '30' }]}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                <Ionicons name={a.icon as any} size={24} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent activity */}
        <View style={styles.sectionRow}>
          {hasMoreActivity && (
            <TouchableOpacity onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowAllTrips(!showAllTrips);
            }}>
              <Text style={styles.viewMore}>{showAllTrips ? '← Less' : '← More'}</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>RECENT ACTIVITY</Text>
            <Text style={styles.sectionSubtitle}>More activity on both sides shows extra trips</Text>
          </View>
          {hasMoreActivity && (
            <TouchableOpacity onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowAllTrips(!showAllTrips);
            }}>
              <Text style={styles.viewMore}>{showAllTrips ? 'Show Less ↑' : 'More Activity →'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {trips.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyText}>No trips yet this month</Text>
            <Text style={styles.emptySub}>Plan your first green commute!</Text>
          </View>
        ) : (
          displayedTrips.map((t) => {
            const modeIcon = t.mode === 'walking' ? 'walk' : t.mode === 'biking' ? 'bicycle' : t.mode === 'ev' ? 'flash' : 'bus';
            const modeColor = t.mode === 'walking' ? EV.accent : t.mode === 'biking' ? EV.info : t.mode === 'ev' ? EV.primary : EV.warning;
            const totalCost = t.steps ? t.steps.reduce((s: number, st: any) => s + (st.cost || 0), 0) : 0;
            const stepCount = t.steps ? t.steps.length : 0;
            const transportSteps = t.steps ? t.steps.filter((s: any) => s.type !== 'walk' && s.type !== 'purchase') : [];

            return (
              <TouchableOpacity
                key={t._id}
                style={styles.tripCard}
                onPress={() => router.push({ pathname: '/trip-detail', params: { trip: JSON.stringify(t) } } as any)}
                activeOpacity={0.85}
              >
                {/* Header */}
                <View style={styles.tripHeader}>
                  <View style={[styles.tripModeIcon, { backgroundColor: modeColor + '18' }]}>
                    <Ionicons name={modeIcon as any} size={20} color={modeColor} />
                  </View>
                  <View style={styles.tripHeaderInfo}>
                    <Text style={styles.tripRoute} numberOfLines={1}>{t.origin} → {t.destination}</Text>
                    <Text style={styles.tripMeta}>
                      {new Date(t.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · {t.distanceKm} km · {t.durationMin || '?'} min
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={EV.textDim} />
                </View>

                {/* Transport used pills */}
                {transportSteps.length > 0 && (
                  <View style={styles.tripPills}>
                    {transportSteps.map((s: any, i: number) => (
                      <View key={i} style={[styles.tripPill, { backgroundColor: EV.bgSurface, borderColor: EV.border }]}>
                        <Ionicons name={s.icon as any} size={11} color={EV.textMuted} />
                        <Text style={styles.tripPillText}>{s.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Quick stats */}
                <View style={styles.tripQuickStats}>
                  <View style={styles.tripStat}>
                    <Ionicons name="leaf" size={12} color={EV.primary} />
                    <Text style={[styles.tripStatVal, { color: EV.primary }]}>{(t.carbonKg || 0).toFixed(1)} kg</Text>
                    <Text style={styles.tripStatLbl}>CO₂ saved</Text>
                  </View>
                  <View style={styles.tripStatDivider} />
                  <View style={styles.tripStat}>
                    <Ionicons name="wallet-outline" size={12} color={EV.warning} />
                    <Text style={[styles.tripStatVal, { color: EV.warning }]}>₱{totalCost}</Text>
                    <Text style={styles.tripStatLbl}>Total spent</Text>
                  </View>
                  <View style={styles.tripStatDivider} />
                  <View style={styles.tripStat}>
                    <Ionicons name="footsteps-outline" size={12} color={EV.info} />
                    <Text style={[styles.tripStatVal, { color: EV.info }]}>{stepCount}</Text>
                    <Text style={styles.tripStatLbl}>Steps</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {trips.length > 3 && (
          <TouchableOpacity
            style={styles.viewMoreBtn}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowAllTrips(!showAllTrips);
            }}
          >
            <Text style={styles.viewMoreBtnText}>{showAllTrips ? 'Show Less' : 'View More'}</Text>
            <Ionicons name={showAllTrips ? 'chevron-up' : 'chevron-down'} size={14} color={EV.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(tabs)' as any)} activeOpacity={0.85}>
          <View style={styles.ctaBtnIcon}>
            <Ionicons name="map" size={18} color={EV.primary} />
          </View>
          <Text style={styles.ctaText}>Plan a Green Commute</Text>
          <View style={styles.ctaBtnIcon}>
            <Ionicons name="arrow-forward" size={18} color={EV.primary} />
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: 14, color: EV.textMuted, fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '900', color: EV.text },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: EV.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: EV.white },

  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 4 },
  monthText: { fontSize: 13, color: EV.textMuted, fontWeight: '600' },

  // Progress card
  progressCard: {
    backgroundColor: EV.bgCard, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: EV.border, marginBottom: 14,
  },
  progressTitle: { fontSize: 11, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginBottom: 20 },
  circlesRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  mainCircleWrap: { flex: 1, alignItems: 'center', gap: 8 },
  circleCenter: { alignItems: 'center' },
  circleBigNum: { fontSize: 28, fontWeight: '900', color: EV.text, lineHeight: 30 },
  circleBigLabel: { fontSize: 11, color: EV.textMuted, fontWeight: '600' },
  circleGoal: { fontSize: 10, color: EV.textDim },
  circleTitle: { fontSize: 13, fontWeight: '700', color: EV.text },
  progressBar: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: 11, color: EV.textMuted, fontWeight: '600' },

  smallCirclesCol: { gap: 12 },
  smallCircleWrap: { alignItems: 'center', gap: 4 },
  circleSmallNum: { fontSize: 18, fontWeight: '900', color: EV.text, lineHeight: 20 },
  circleSmallUnit: { fontSize: 10, color: EV.textMuted },
  smallCircleLabel: { fontSize: 11, fontWeight: '600', color: EV.textMuted },

  distanceStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: EV.bgSurface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: EV.border,
  },
  distanceText: { flex: 1, fontSize: 13, color: EV.textMuted, fontWeight: '600' },
  distanceValue: { fontSize: 14, fontWeight: '900' },

  // Balance
  balanceCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: EV.border, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center',
  },
  balanceLeft: { flex: 1 },
  balanceLabel: { fontSize: 11, color: EV.textMuted, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  balanceAmount: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  balanceDivider: { width: 1, height: 50, backgroundColor: EV.border, marginHorizontal: 16 },
  balanceRight: { gap: 10 },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceItemLabel: { fontSize: 11, color: EV.textMuted, fontWeight: '600', width: 40 },
  balanceItemVal: { fontSize: 13, fontWeight: '800' },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  sectionSubtitle: { fontSize: 11, color: EV.textDim, fontWeight: '600', marginTop: 4 },
  viewMore: { fontSize: 12, fontWeight: '700', color: EV.primary },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionCard: { width: (width - 50) / 2, backgroundColor: EV.bgCard, borderRadius: 18, padding: 18, alignItems: 'center', gap: 10, borderWidth: 1 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700' },

  // Trip cards
  tripCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: EV.border, marginBottom: 12,
  },
  tripHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tripModeIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tripHeaderInfo: { flex: 1 },
  tripRoute: { fontSize: 14, fontWeight: '800', color: EV.text, marginBottom: 2 },
  tripMeta: { fontSize: 11, color: EV.textMuted },
  tripPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tripPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  tripPillText: { fontSize: 10, color: EV.textMuted, fontWeight: '600' },
  tripQuickStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: EV.bgSurface, borderRadius: 12, padding: 10 },
  tripStat: { flex: 1, alignItems: 'center', gap: 2 },
  tripStatVal: { fontSize: 13, fontWeight: '800' },
  tripStatLbl: { fontSize: 9, color: EV.textDim, fontWeight: '600' },
  tripStatDivider: { width: 1, height: 28, backgroundColor: EV.border },
  emptyActivity: { padding: 32, alignItems: 'center', gap: 8, backgroundColor: EV.bgCard, borderRadius: 20, borderWidth: 1, borderColor: EV.border, marginBottom: 20 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, fontWeight: '700', color: EV.text },
  emptySub: { fontSize: 13, color: EV.textMuted },

  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: EV.bgSurface, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 20, marginBottom: 8, borderWidth: 1.5, borderColor: EV.primary },
  ctaBtnIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: EV.primary + '18', alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 15, fontWeight: '800', color: EV.primary, flex: 1, textAlign: 'center' },
  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: EV.bgCard, borderRadius: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: EV.border },
  viewMoreBtnText: { fontSize: 13, fontWeight: '700', color: EV.primary },
});
