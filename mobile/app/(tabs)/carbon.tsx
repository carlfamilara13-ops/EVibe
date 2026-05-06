import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, Dimensions, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';
import { useCarbonData } from '@/hooks/useCarbonData';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CarbonScreen() {
  const { loading, error, carbonData, refetch } = useCarbonData();
  const router = useRouter();
  const [tripInfo, setTripInfo] = React.useState<any>(null);

  // Load trip info from AsyncStorage
  React.useEffect(() => {
    loadTripInfo();
  }, []);

  const loadTripInfo = async () => {
    const tripStr = await AsyncStorage.getItem('activeTrip');
    if (tripStr) {
      setTripInfo(JSON.parse(tripStr));
    }
  };

  // Reload data when screen comes into focus (check for new trip)
  useFocusEffect(
    React.useCallback(() => {
      loadTripInfo();
      refetch();
    }, [])
  );

  // Loading skeleton
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={EV.bg} />
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Carbon Footprint</Text>
            <Text style={styles.headerSub}>Your environmental impact</Text>
          </View>
          <View style={styles.leafBadge}>
            <Ionicons name="leaf" size={16} color={EV.bg} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={EV.primary} />
          <Text style={styles.loadingText}>Loading carbon data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error or no data
  if (error || !carbonData) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={EV.bg} />
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Carbon Footprint</Text>
            <Text style={styles.headerSub}>Your environmental impact</Text>
          </View>
          <View style={styles.leafBadge}>
            <Ionicons name="leaf" size={16} color={EV.bg} />
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="leaf-outline" size={64} color={EV.textDim} />
          <Text style={styles.errorTitle}>No Carbon Data Available</Text>
          <Text style={styles.errorText}>
            {error || 'Start a trip to see your carbon footprint'}
          </Text>
          <TouchableOpacity style={styles.setupButton} onPress={() => router.push('/setup')}>
            <Ionicons name="add-circle" size={20} color={EV.bg} />
            <Text style={styles.setupButtonText}>Plan a Trip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Extract data
  const saved = carbonData.savedKg || 0;
  const treesSaved = carbonData.treesEquivalent || 0;
  const reductionPct = carbonData.savedPercentage || 0;
  const evCO2 = carbonData.tripEmission || 0;
  const gasCO2 = carbonData.carEmission || 0;
  const distanceKm = carbonData.distanceKm || 0;
  const energyKwh = carbonData.energyKwh || 0;
  const evPct = gasCO2 > 0 ? evCO2 / gasCO2 : 0;
  const gridEmissionFactor = 0.233; // Grid emission factor for display

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Carbon Footprint</Text>
          <Text style={styles.headerSub}>Your environmental impact</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => router.push('/debug-carbon')} style={styles.debugBtn}>
            <Ionicons name="bug" size={16} color={EV.textMuted} />
          </TouchableOpacity>
          <View style={styles.leafBadge}>
            <Ionicons name="leaf" size={16} color={EV.bg} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />

          <Text style={styles.heroEyebrow}>CO₂ SAVED THIS TRIP</Text>
          <Text style={styles.heroNumber}>{saved.toFixed(1)}</Text>
          <Text style={styles.heroUnit}>kilograms of CO₂</Text>

          <View style={styles.heroDivider} />

          {/* Trees row */}
          <View style={styles.treesRow}>
            <View style={styles.treesIconGroup}>
              {[...Array(Math.min(Math.ceil(treesSaved), 5))].map((_, i) => (
                <View key={i} style={[styles.treeIcon, { marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }]}>
                  <Ionicons name="leaf" size={14} color={EV.bg} />
                </View>
              ))}
            </View>
            <View style={styles.treesText}>
              <Text style={styles.treesNum}>{treesSaved.toFixed(1)} trees</Text>
              <Text style={styles.treesSub}>planted for a year equivalent</Text>
            </View>
          </View>

          {/* Active trip badge */}
          {tripInfo && (
            <View style={styles.activeTripBadge}>
              <Ionicons name="navigate" size={14} color={EV.primary} />
              <Text style={styles.activeTripText}>
                {tripInfo.origin} → {tripInfo.destination}
              </Text>
            </View>
          )}

          {/* Reduction badge */}
          <View style={styles.reductionBadge}>
            <Ionicons name="trending-down" size={16} color={EV.primary} />
            <Text style={styles.reductionText}>{reductionPct.toFixed(0)}% less emissions than a gas car</Text>
          </View>
        </View>

        {/* EV vs Gas comparison */}
        <Text style={styles.sectionTitle}>EMISSIONS COMPARISON</Text>
        <View style={styles.compareCard}>

          {/* Visual bars */}
          <View style={styles.barsSection}>
            <View style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <View style={[styles.barDot, { backgroundColor: EV.primary }]} />
                <Text style={styles.barName}>Your {carbonData.mode === 'ev' ? 'EV' : carbonData.mode}</Text>
                <Text style={[styles.barKg, { color: EV.primary }]}>{evCO2.toFixed(1)} kg</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${evPct * 100}%` as any, backgroundColor: EV.primary }]} />
              </View>
            </View>

            <View style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <View style={[styles.barDot, { backgroundColor: EV.danger }]} />
                <Text style={styles.barName}>Gas Car</Text>
                <Text style={[styles.barKg, { color: EV.danger }]}>{gasCO2.toFixed(1)} kg</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '100%', backgroundColor: EV.danger }]} />
              </View>
            </View>
          </View>

          {/* Side by side numbers */}
          <View style={styles.compareNumbers}>
            <View style={styles.compareBox}>
              <View style={[styles.compareIconBox, { backgroundColor: EV.primary + '20' }]}>
                <Ionicons name={tripInfo?.mode === 'ev' ? 'flash' : tripInfo?.mode === 'biking' ? 'bicycle' : tripInfo?.mode === 'walking' ? 'walk' : 'bus'} size={22} color={EV.primary} />
              </View>
              <Text style={styles.compareBoxLabel}>{tripInfo?.mode === 'ev' ? 'Electric' : tripInfo?.mode || 'EV'}</Text>
              <Text style={[styles.compareBoxVal, { color: EV.primary }]}>{evCO2.toFixed(1)}</Text>
              <Text style={styles.compareBoxUnit}>kg CO₂</Text>
            </View>

            <View style={styles.savedBox}>
              <Text style={styles.savedBoxLabel}>SAVED</Text>
              <Text style={styles.savedBoxVal}>{saved.toFixed(1)}</Text>
              <Text style={styles.savedBoxUnit}>kg</Text>
            </View>

            <View style={styles.compareBox}>
              <View style={[styles.compareIconBox, { backgroundColor: EV.danger + '20' }]}>
                <Ionicons name="car" size={22} color={EV.danger} />
              </View>
              <Text style={styles.compareBoxLabel}>Gasoline</Text>
              <Text style={[styles.compareBoxVal, { color: EV.danger }]}>{gasCO2.toFixed(1)}</Text>
              <Text style={styles.compareBoxUnit}>kg CO₂</Text>
            </View>
          </View>
        </View>

        {/* Trip stats */}
        <Text style={styles.sectionTitle}>TRIP DETAILS</Text>
        <View style={styles.statsRow}>
          {[
            { icon: 'speedometer-outline', label: 'Distance', value: `${distanceKm.toFixed(1)} km`, color: EV.accent },
            { icon: 'flash-outline', label: 'Energy', value: energyKwh > 0 ? `${energyKwh.toFixed(1)} kWh` : 'N/A', color: EV.primary },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.statsRow}>
          {[
            { icon: 'cloud-outline', label: 'Grid Factor', value: `${gridEmissionFactor} kg/kWh`, color: EV.info },
            { icon: 'trending-down-outline', label: 'Reduction', value: `${reductionPct.toFixed(0)}%`, color: EV.neon },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Impact message */}
        <View style={styles.impactCard}>
          <View style={styles.impactIconWrap}>
            <Ionicons name="earth" size={28} color={EV.primary} />
          </View>
          <View style={styles.impactBody}>
            <Text style={styles.impactTitle}>You're making a difference 🌍</Text>
            <Text style={styles.impactText}>
              By choosing {tripInfo?.mode === 'ev' ? 'electric' : tripInfo?.mode || 'this mode'}, you emitted {reductionPct.toFixed(0)}% less CO₂ than a gasoline car — equivalent to planting {treesSaved.toFixed(1)} trees.
            </Text>
          </View>
        </View>

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
  leafBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: EV.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: EV.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: EV.border,
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 14, color: EV.textMuted, fontWeight: '600' },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: EV.text },
  errorText: { fontSize: 14, color: EV.textMuted, textAlign: 'center', lineHeight: 20 },
  setupButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: EV.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  setupButtonText: { color: EV.bg, fontWeight: '700', fontSize: 15 },

  heroCard: {
    margin: 16,
    backgroundColor: EV.bgCard,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: EV.primaryDark,
    overflow: 'hidden',
  },
  heroGlowTop: {
    position: 'absolute',
    top: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: EV.primary + '12',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: EV.primaryDeep + '18',
  },
  heroEyebrow: { fontSize: 11, color: EV.textMuted, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  heroNumber: { fontSize: 72, fontWeight: '900', color: EV.primary, letterSpacing: -3, lineHeight: 76 },
  heroUnit: { fontSize: 14, color: EV.textMuted, marginBottom: 20 },
  heroDivider: { width: 60, height: 2, backgroundColor: EV.border, marginBottom: 20 },

  treesRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  treesIconGroup: { flexDirection: 'row' },
  treeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: EV.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: EV.bgCard,
  },
  treesText: {},
  treesNum: { fontSize: 16, fontWeight: '800', color: EV.text },
  treesSub: { fontSize: 11, color: EV.textMuted },

  reductionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: EV.primary + '18',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: EV.primaryDark,
  },
  reductionText: { fontSize: 13, color: EV.primary, fontWeight: '700' },

  activeTripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: EV.primary + '18',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: EV.primary + '40',
    marginBottom: 16,
  },
  activeTripText: { fontSize: 13, color: EV.primary, fontWeight: '700' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: EV.primary,
    letterSpacing: 1.5,
    marginHorizontal: 16,
    marginBottom: 12,
  },

  compareCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: EV.bgCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: EV.border,
    gap: 20,
  },
  barsSection: { gap: 14 },
  barItem: { gap: 8 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barDot: { width: 8, height: 8, borderRadius: 4 },
  barName: { flex: 1, fontSize: 13, color: EV.textMuted, fontWeight: '600' },
  barKg: { fontSize: 13, fontWeight: '800' },
  barTrack: { height: 10, backgroundColor: EV.bgSurface, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },

  compareNumbers: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compareBox: { alignItems: 'center', gap: 6, flex: 1 },
  compareIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  compareBoxLabel: { fontSize: 11, color: EV.textMuted, fontWeight: '600' },
  compareBoxVal: { fontSize: 24, fontWeight: '900' },
  compareBoxUnit: { fontSize: 11, color: EV.textDim },
  savedBox: {
    alignItems: 'center',
    backgroundColor: EV.bgSurface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: EV.primaryDark,
    marginHorizontal: 8,
  },
  savedBoxLabel: { fontSize: 9, color: EV.primary, fontWeight: '800', letterSpacing: 1.5 },
  savedBoxVal: { fontSize: 22, fontWeight: '900', color: EV.primary },
  savedBoxUnit: { fontSize: 11, color: EV.textMuted },

  statsRow: { flexDirection: 'row', marginHorizontal: 12, gap: 10, marginBottom: 10 },
  statCard: {
    flex: 1,
    backgroundColor: EV.bgCard,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: EV.border,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 15, fontWeight: '800' },
  statLbl: { fontSize: 11, color: EV.textMuted },

  impactCard: {
    flexDirection: 'row',
    gap: 14,
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: EV.bgCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: EV.primaryDark,
    alignItems: 'flex-start',
  },
  impactIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: EV.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactBody: { flex: 1 },
  impactTitle: { fontSize: 15, fontWeight: '800', color: EV.text, marginBottom: 6 },
  impactText: { fontSize: 13, color: EV.textMuted, lineHeight: 20 },
});
