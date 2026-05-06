import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NATURE as EV } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const STEP_COLORS: Record<string, string> = {
  walk:     EV.accent,
  jeepney:  EV.warning,
  bus:      EV.warning,
  train:    EV.info,
  tricycle: '#FF7043',
  car:      EV.danger,
  ev:       EV.primary,
  biking:   EV.primaryLight,
  purchase: '#AB47BC',
};

const STEP_ICONS: Record<string, string> = {
  walk:     'walk',
  jeepney:  'bus',
  bus:      'bus',
  train:    'train',
  tricycle: 'bicycle',
  car:      'car',
  ev:       'flash',
  biking:   'bicycle',
  purchase: 'bag-handle',
};

export default function TripDetailScreen() {
  const router = useRouter();
  const { trip: tripStr } = useLocalSearchParams<{ trip: string }>();
  const trip = tripStr ? JSON.parse(tripStr) : null;

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={EV.text} />
        </TouchableOpacity>
        <View style={styles.center}><Text style={styles.emptyText}>Trip not found</Text></View>
      </SafeAreaView>
    );
  }

  const steps = trip.steps || [];
  const totalCost = steps.reduce((s: number, st: any) => s + (st.cost || 0), 0);
  const totalCO2 = steps.reduce((s: number, st: any) => s + (st.co2Kg || 0), 0);
  const carCO2 = trip.distanceKm * 0.21;
  const co2Saved = Math.max(carCO2 - totalCO2, 0);
  const fareTotal = steps.filter((s: any) => s.type !== 'walk' && s.type !== 'purchase').reduce((s: number, st: any) => s + (st.cost || 0), 0);
  const purchaseTotal = steps.filter((s: any) => s.type === 'purchase').reduce((s: number, st: any) => s + (st.cost || 0), 0);
  const transportSteps = steps.filter((s: any) => s.type !== 'walk' && s.type !== 'purchase');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={EV.statusBar} backgroundColor={EV.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={EV.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Trip Details</Text>
          <Text style={styles.headerSub}>
            {new Date(trip.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Route hero */}
        <View style={styles.routeHero}>
          <View style={styles.routeHeroGlow} />
          <View style={styles.routePoints}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: EV.primary }]} />
              <View>
                <Text style={styles.routePointLabel}>FROM</Text>
                <Text style={styles.routePointName}>{trip.origin}</Text>
              </View>
            </View>
            <View style={styles.routeLine}>
              {transportSteps.map((s: any, i: number) => (
                <View key={i} style={[styles.routeLineSegment, { backgroundColor: STEP_COLORS[s.type] || EV.primary }]} />
              ))}
            </View>
            <View style={[styles.routePoint, { justifyContent: 'flex-end' }]}>
              <View>
                <Text style={[styles.routePointLabel, { textAlign: 'right' }]}>TO</Text>
                <Text style={styles.routePointName}>{trip.destination}</Text>
              </View>
              <View style={[styles.routeDot, { backgroundColor: EV.danger }]} />
            </View>
          </View>

          {/* Summary stats */}
          <View style={styles.heroStats}>
            {[
              { icon: 'navigate-outline', label: 'Distance', value: `${trip.distanceKm} km`, color: EV.primary },
              { icon: 'time-outline', label: 'Duration', value: `${trip.durationMin || '?'} min`, color: EV.info },
              { icon: 'wallet-outline', label: 'Total Spent', value: `₱${totalCost}`, color: EV.warning },
              { icon: 'leaf-outline', label: 'CO₂ Saved', value: `${co2Saved.toFixed(1)} kg`, color: EV.accent },
            ].map((s, i) => (
              <View key={i} style={styles.heroStat}>
                <View style={[styles.heroStatIcon, { backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon as any} size={16} color={s.color} />
                </View>
                <Text style={[styles.heroStatVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.heroStatLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>JOURNEY TIMELINE</Text>
        <View style={styles.timelineCard}>
          {steps.map((step: any, i: number) => {
            const color = STEP_COLORS[step.type] || EV.primary;
            const icon = STEP_ICONS[step.type] || step.icon || 'ellipse';
            const isPurchase = step.type === 'purchase';
            const isLast = i === steps.length - 1;

            return (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineIcon, { backgroundColor: color }]}>
                    <Ionicons name={icon as any} size={16} color={EV.white} />
                  </View>
                  {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '30' }]} />}
                </View>

                <View style={[styles.timelineContent, !isLast && { paddingBottom: 20 }]}>
                  <View style={styles.timelineTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineLabel}>{step.label}</Text>
                      <Text style={styles.timelinePlace}>{step.place}</Text>
                    </View>
                    {step.cost > 0 && (
                      <View style={[styles.costBadge, {
                        backgroundColor: isPurchase ? '#AB47BC20' : EV.warning + '20',
                        borderColor: isPurchase ? '#AB47BC50' : EV.warning + '50',
                      }]}>
                        <Text style={[styles.costBadgeText, { color: isPurchase ? '#AB47BC' : EV.warning }]}>
                          ₱{step.cost}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.stepDetails}>
                    {step.distanceKm > 0 && (
                      <View style={styles.stepChip}>
                        <Ionicons name="navigate-outline" size={10} color={EV.textDim} />
                        <Text style={styles.stepChipText}>{step.distanceKm} km</Text>
                      </View>
                    )}
                    {step.durationMin > 0 && (
                      <View style={styles.stepChip}>
                        <Ionicons name="time-outline" size={10} color={EV.textDim} />
                        <Text style={styles.stepChipText}>{step.durationMin} min</Text>
                      </View>
                    )}
                    {step.co2Kg > 0 && (
                      <View style={styles.stepChip}>
                        <Ionicons name="cloud-outline" size={10} color={EV.textDim} />
                        <Text style={styles.stepChipText}>{step.co2Kg} kg CO₂</Text>
                      </View>
                    )}
                    {step.cost === 0 && !isPurchase && (
                      <View style={[styles.stepChip, { backgroundColor: EV.primary + '15', borderColor: EV.primary + '30' }]}>
                        <Ionicons name="leaf" size={10} color={EV.primary} />
                        <Text style={[styles.stepChipText, { color: EV.primary, fontWeight: '700' }]}>Free</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Cost breakdown */}
        <Text style={styles.sectionTitle}>COST BREAKDOWN</Text>
        <View style={styles.costCard}>
          <View style={styles.costRow}>
            <View style={[styles.costIcon, { backgroundColor: EV.warning + '18' }]}>
              <Ionicons name="bus-outline" size={16} color={EV.warning} />
            </View>
            <Text style={styles.costLabel}>Transport fares</Text>
            <Text style={[styles.costValue, { color: EV.warning }]}>₱{fareTotal}</Text>
          </View>
          <View style={[styles.costRow, styles.costBorder]}>
            <View style={[styles.costIcon, { backgroundColor: '#AB47BC20' }]}>
              <Ionicons name="bag-handle-outline" size={16} color="#AB47BC" />
            </View>
            <Text style={styles.costLabel}>Purchases</Text>
            <Text style={[styles.costValue, { color: '#AB47BC' }]}>₱{purchaseTotal}</Text>
          </View>
          <View style={[styles.costRow, styles.costBorder, styles.costTotalRow]}>
            <View style={[styles.costIcon, { backgroundColor: EV.primary + '18' }]}>
              <Ionicons name="wallet-outline" size={16} color={EV.primary} />
            </View>
            <Text style={[styles.costLabel, { fontWeight: '800', color: EV.text }]}>Total</Text>
            <Text style={[styles.costValue, { color: EV.primary, fontSize: 18 }]}>₱{totalCost}</Text>
          </View>
        </View>

        {/* Carbon impact */}
        <Text style={styles.sectionTitle}>CARBON IMPACT</Text>
        <View style={styles.carbonCard}>
          <View style={styles.carbonRow}>
            <View style={styles.carbonItem}>
              <Text style={styles.carbonItemLabel}>Your commute</Text>
              <Text style={[styles.carbonItemVal, { color: EV.primary }]}>{totalCO2.toFixed(2)} kg</Text>
            </View>
            <View style={styles.carbonVs}>
              <Text style={styles.carbonVsText}>vs</Text>
            </View>
            <View style={styles.carbonItem}>
              <Text style={styles.carbonItemLabel}>By car</Text>
              <Text style={[styles.carbonItemVal, { color: EV.danger }]}>{carCO2.toFixed(2)} kg</Text>
            </View>
          </View>
          <View style={styles.carbonSavedBadge}>
            <Ionicons name="leaf" size={18} color={EV.primary} />
            <Text style={styles.carbonSavedText}>
              You saved <Text style={{ color: EV.primary, fontWeight: '900' }}>{co2Saved.toFixed(2)} kg CO₂</Text> by commuting green 🌍
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: EV.textMuted },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: EV.border },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: EV.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: EV.border },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: EV.text },
  headerSub: { fontSize: 12, color: EV.textMuted, marginTop: 1 },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginBottom: 12, marginTop: 20 },

  routeHero: { backgroundColor: EV.bgCard, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: EV.border, marginTop: 16, overflow: 'hidden' },
  routeHeroGlow: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: EV.primary + '08' },
  routePoints: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routePointLabel: { fontSize: 9, color: EV.textDim, fontWeight: '700', letterSpacing: 1 },
  routePointName: { fontSize: 13, fontWeight: '800', color: EV.text },
  routeLine: { flex: 1, flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden', gap: 2 },
  routeLineSegment: { flex: 1, borderRadius: 2 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between' },
  heroStat: { alignItems: 'center', gap: 4 },
  heroStatIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  heroStatVal: { fontSize: 13, fontWeight: '900' },
  heroStatLbl: { fontSize: 9, color: EV.textMuted, fontWeight: '600' },

  timelineCard: { backgroundColor: EV.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: EV.border },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 36 },
  timelineIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, marginVertical: 4, borderRadius: 1, minHeight: 16 },
  timelineContent: { flex: 1 },
  timelineTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  timelineLabel: { fontSize: 14, fontWeight: '800', color: EV.text },
  timelinePlace: { fontSize: 12, color: EV.textMuted, marginTop: 2 },
  costBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  costBadgeText: { fontSize: 13, fontWeight: '800' },
  stepDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: EV.bgSurface, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1, borderColor: EV.border },
  stepChipText: { fontSize: 10, color: EV.textDim },

  costCard: { backgroundColor: EV.bgCard, borderRadius: 20, borderWidth: 1, borderColor: EV.border, overflow: 'hidden' },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  costBorder: { borderTopWidth: 1, borderTopColor: EV.border },
  costTotalRow: { backgroundColor: EV.bgSurface },
  costIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  costLabel: { flex: 1, fontSize: 14, color: EV.textMuted, fontWeight: '600' },
  costValue: { fontSize: 15, fontWeight: '800' },

  carbonCard: { backgroundColor: EV.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: EV.border },
  carbonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  carbonItem: { flex: 1, alignItems: 'center', gap: 4 },
  carbonItemLabel: { fontSize: 12, color: EV.textMuted, fontWeight: '600' },
  carbonItemVal: { fontSize: 22, fontWeight: '900' },
  carbonVs: { paddingHorizontal: 12 },
  carbonVsText: { fontSize: 12, color: EV.textDim, fontWeight: '700' },
  carbonSavedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: EV.primary + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: EV.border },
  carbonSavedText: { flex: 1, fontSize: 13, color: EV.textMuted, lineHeight: 18 },
});
