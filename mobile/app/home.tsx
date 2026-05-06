import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';
import { getTrips } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const res = await getTrips(parsed.id);
          setTrips(res.data || []);
        }
      } catch {}
    })();
  }, []);

  const totalCO2 = trips.reduce((s: number, t: any) => s + (t.carbonSaved || 0), 0);
  const trees = (totalCO2 / 21.77).toFixed(1);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}, {user?.name?.split(' ')[0] || 'Driver'} 👋</Text>
          <Text style={styles.headerSub}>Ready for an eco-friendly trip?</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Eco stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsGlow} />
          <Text style={styles.statsLabel}>YOUR ECO IMPACT</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="car-outline" size={22} color={EV.primary} />
              <Text style={styles.statVal}>{trips.length}</Text>
              <Text style={styles.statLbl}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="cloud-outline" size={22} color={EV.accent} />
              <Text style={styles.statVal}>{totalCO2.toFixed(1)}kg</Text>
              <Text style={styles.statLbl}>CO₂ Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="leaf-outline" size={22} color={EV.neon} />
              <Text style={styles.statVal}>{trees}</Text>
              <Text style={styles.statLbl}>Trees</Text>
            </View>
          </View>
        </View>

        {/* Plan trip CTA */}
        <TouchableOpacity style={styles.planBtn} onPress={() => router.push('/(tabs)')} activeOpacity={0.85}>
          <View style={styles.planBtnLeft}>
            <View style={styles.planBtnIcon}>
              <Ionicons name="navigate" size={22} color={EV.bg} />
            </View>
            <View>
              <Text style={styles.planBtnTitle}>Plan New Trip</Text>
              <Text style={styles.planBtnSub}>Find route + charging stations</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color={EV.bg} />
        </TouchableOpacity>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          {[
            { icon: 'flash', label: 'Stations', color: EV.primary, route: '/(tabs)/stations' },
            { icon: 'wallet', label: 'Budget', color: EV.warning, route: '/(tabs)/budget' },
            { icon: 'leaf', label: 'Carbon', color: EV.accent, route: '/(tabs)/carbon' },
            { icon: 'star', label: 'Eco Score', color: EV.neon, route: '/(tabs)/score' },
          ].map(q => (
            <TouchableOpacity key={q.label} style={styles.quickBtn} onPress={() => router.push(q.route as any)}>
              <View style={[styles.quickIcon, { backgroundColor: q.color + '20' }]}>
                <Ionicons name={q.icon as any} size={20} color={q.color} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent trips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT TRIPS</Text>
          {trips.length > 0 && <Text style={styles.sectionCount}>{trips.length} total</Text>}
        </View>

        {trips.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="map-outline" size={40} color={EV.textDim} />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySub}>Plan your first EV trip to get started</Text>
          </View>
        ) : (
          trips.slice(0, 5).map((trip: any, i: number) => (
            <TouchableOpacity key={trip._id || i} style={styles.tripCard} onPress={() => router.push('/dashboard')} activeOpacity={0.8}>
              <View style={styles.tripLeft}>
                <View style={styles.tripIconWrap}>
                  <Ionicons name="navigate" size={16} color={EV.primary} />
                </View>
                <View>
                  <Text style={styles.tripRoute}>{trip.origin || 'Origin'} → {trip.destination || 'Destination'}</Text>
                  <Text style={styles.tripDate}>{trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : ''}</Text>
                </View>
              </View>
              <View style={[styles.scoreBadge, { borderColor: EV.primary + '60' }]}>
                <Text style={styles.scoreText}>{trip.ecoScore || '--'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: EV.border,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: EV.text },
  headerSub: { fontSize: 12, color: EV.textMuted, marginTop: 2 },
  avatarBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: EV.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: EV.bg },
  scroll: { padding: 16 },

  statsCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: EV.primaryDark, marginBottom: 16, overflow: 'hidden',
  },
  statsGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: EV.primary + '10',
  },
  statsLabel: { fontSize: 10, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', gap: 6 },
  statVal: { fontSize: 20, fontWeight: '900', color: EV.text },
  statLbl: { fontSize: 11, color: EV.textMuted },
  statDivider: { width: 1, height: 40, backgroundColor: EV.border },

  planBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: EV.primary, borderRadius: 18, padding: 18, marginBottom: 16,
  },
  planBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  planBtnIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: EV.bg + '30', alignItems: 'center', justifyContent: 'center',
  },
  planBtnTitle: { fontSize: 16, fontWeight: '800', color: EV.bg },
  planBtnSub: { fontSize: 12, color: EV.bg + 'BB', marginTop: 2 },

  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickBtn: {
    flex: 1, backgroundColor: EV.bgCard, borderRadius: 14,
    padding: 12, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: EV.border,
  },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 10, fontWeight: '700', color: EV.textMuted },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: EV.primary, letterSpacing: 1.5 },
  sectionCount: { fontSize: 12, color: EV.textMuted },

  emptyCard: {
    backgroundColor: EV.bgCard, borderRadius: 18, padding: 32,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: EV.border,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: EV.text },
  emptySub: { fontSize: 13, color: EV.textMuted, textAlign: 'center' },

  tripCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: EV.bgCard, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: EV.border, marginBottom: 10,
  },
  tripLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tripIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: EV.primary + '20', alignItems: 'center', justifyContent: 'center',
  },
  tripRoute: { fontSize: 14, fontWeight: '700', color: EV.text },
  tripDate: { fontSize: 12, color: EV.textMuted, marginTop: 2 },
  scoreBadge: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: EV.bgSurface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  scoreText: { fontSize: 15, fontWeight: '900', color: EV.primary },
});
