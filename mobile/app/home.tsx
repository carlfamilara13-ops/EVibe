import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NATURE as EV } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getIncomes, getUserExpenses, getTrips } from '@/services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const MONTH = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });
const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

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

  const quickActions = [
    { icon: 'map', label: 'Plan Route', color: EV.primary, route: '/(tabs)' },
    { icon: 'flash', label: 'Stations', color: EV.info, route: '/(tabs)/stations' },
    { icon: 'wallet', label: 'Budget', color: EV.warning, route: '/(tabs)/budget' },
    { icon: 'leaf', label: 'Carbon', color: EV.accent, route: '/(tabs)/carbon' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={EV.primary} />
        </View>
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
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(tabs)/score')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Month label */}
        <View style={styles.monthRow}>
          <Ionicons name="calendar-outline" size={14} color={EV.textMuted} />
          <Text style={styles.monthText}>{MONTH} Activity</Text>
        </View>

        {/* Balance hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>CURRENT BALANCE</Text>
          <Text style={[styles.heroAmount, { color: balanceColor }]}>
            ₱{balance.toLocaleString('en', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.heroRow}>
            <View style={styles.heroItem}>
              <View style={[styles.heroIcon, { backgroundColor: EV.primary + '20' }]}>
                <Ionicons name="arrow-down-circle" size={18} color={EV.primary} />
              </View>
              <View>
                <Text style={styles.heroItemLabel}>Income</Text>
                <Text style={[styles.heroItemValue, { color: EV.primary }]}>
                  ₱{totalIncome.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroItem}>
              <View style={[styles.heroIcon, { backgroundColor: EV.danger + '20' }]}>
                <Ionicons name="arrow-up-circle" size={18} color={EV.danger} />
              </View>
              <View>
                <Text style={styles.heroItemLabel}>Expenses</Text>
                <Text style={[styles.heroItemValue, { color: EV.danger }]}>
                  ₱{totalExpenses.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: EV.primary + '40' }]}>
            <View style={[styles.statIcon, { backgroundColor: EV.primary + '15' }]}>
              <Text style={styles.statEmoji}>🌿</Text>
            </View>
            <Text style={[styles.statValue, { color: EV.primary }]}>{totalCO2Saved.toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>CO₂ Saved</Text>
          </View>
          <View style={[styles.statCard, { borderColor: EV.info + '40' }]}>
            <View style={[styles.statIcon, { backgroundColor: EV.info + '15' }]}>
              <Text style={styles.statEmoji}>🚌</Text>
            </View>
            <Text style={[styles.statValue, { color: EV.info }]}>{trips.length}</Text>
            <Text style={styles.statLabel}>Commutes</Text>
          </View>
          <View style={[styles.statCard, { borderColor: EV.accent + '40' }]}>
            <View style={[styles.statIcon, { backgroundColor: EV.accent + '15' }]}>
              <Text style={styles.statEmoji}>📍</Text>
            </View>
            <Text style={[styles.statValue, { color: EV.accent }]}>{totalDistance.toFixed(0)} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
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
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <View style={styles.activityCard}>
          {/* Recent trips */}
          {trips.slice(0, 2).map((t, i) => (
            <View key={t._id} style={[styles.activityRow, i < 1 && styles.activityBorder]}>
              <View style={[styles.activityIcon, { backgroundColor: EV.primary + '18' }]}>
                <Ionicons name="bus" size={16} color={EV.primary} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{t.origin} → {t.destination}</Text>
                <Text style={styles.activitySub}>{t.distanceKm} km · {t.mode}</Text>
              </View>
              <Text style={[styles.activityBadge, { color: EV.primary }]}>
                -{(t.carbonKg || 0).toFixed(1)} kg CO₂
              </Text>
            </View>
          ))}
          {/* Recent expenses */}
          {expenses.slice(0, 2).map((e, i) => (
            <View key={e._id} style={[styles.activityRow, styles.activityBorder]}>
              <View style={[styles.activityIcon, { backgroundColor: EV.danger + '18' }]}>
                <Ionicons name="receipt-outline" size={16} color={EV.danger} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{e.description || e.category}</Text>
                <Text style={styles.activitySub}>{new Date(e.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.activityBadge, { color: EV.danger }]}>
                -₱{e.amount.toLocaleString()}
              </Text>
            </View>
          ))}
          {trips.length === 0 && expenses.length === 0 && (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyText}>No activity yet this month</Text>
              <Text style={styles.emptySub}>Plan your first green commute!</Text>
            </View>
          )}
        </View>

        {/* Go commute CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push('/(tabs)' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="map" size={20} color={EV.white} />
          <Text style={styles.ctaText}>Plan a Green Commute</Text>
          <Ionicons name="arrow-forward" size={18} color={EV.white} />
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
  avatarBtn: {},
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: EV.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: EV.white },

  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: 4 },
  monthText: { fontSize: 13, color: EV.textMuted, fontWeight: '600' },

  heroCard: {
    backgroundColor: EV.bgCard, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: EV.border, marginBottom: 16, overflow: 'hidden',
  },
  heroGlow: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: EV.primary + '0C' },
  heroLabel: { fontSize: 11, color: EV.textMuted, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  heroAmount: { fontSize: 38, fontWeight: '900', marginBottom: 16, letterSpacing: -1 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  heroItemLabel: { fontSize: 11, color: EV.textMuted, fontWeight: '600' },
  heroItemValue: { fontSize: 15, fontWeight: '800' },
  heroDivider: { width: 1, height: 36, backgroundColor: EV.border, marginHorizontal: 12 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: EV.bgCard, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 15, fontWeight: '900' },
  statLabel: { fontSize: 10, color: EV.textMuted, fontWeight: '600', textAlign: 'center' },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginBottom: 12 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionCard: {
    width: (width - 50) / 2, backgroundColor: EV.bgCard,
    borderRadius: 18, padding: 18, alignItems: 'center', gap: 10, borderWidth: 1,
  },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700' },

  activityCard: { backgroundColor: EV.bgCard, borderRadius: 20, borderWidth: 1, borderColor: EV.border, overflow: 'hidden', marginBottom: 20 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  activityBorder: { borderTopWidth: 1, borderTopColor: EV.border },
  activityIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 13, fontWeight: '700', color: EV.text },
  activitySub: { fontSize: 11, color: EV.textMuted, marginTop: 2 },
  activityBadge: { fontSize: 12, fontWeight: '800' },
  emptyActivity: { padding: 32, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, fontWeight: '700', color: EV.text },
  emptySub: { fontSize: 13, color: EV.textMuted },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: EV.primary, borderRadius: 18,
    paddingVertical: 18, marginBottom: 8,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: EV.white, flex: 1, textAlign: 'center' },
});
