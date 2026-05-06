import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';
import { geocode, getRoute } from '@/services/ors';

const { width } = Dimensions.get('window');

const MODES = [
  {
    key: 'ev',
    label: 'Electric Vehicle',
    icon: 'flash',
    color: EV.primary,
    desc: 'Zero emissions',
    costPerKm: 2.5,   // ₱ per km (electricity)
    emoji: '⚡',
  },
  {
    key: 'commute',
    label: 'Commute',
    icon: 'bus',
    color: EV.info,
    desc: 'Bus / Jeepney',
    costPerKm: 3.0,   // ₱ per km (fare)
    emoji: '🚌',
  },
  {
    key: 'walk',
    label: 'Walk',
    icon: 'walk',
    color: EV.accent,
    desc: 'Free & healthy',
    costPerKm: 0,
    emoji: '🚶',
  },
  {
    key: 'cycle',
    label: 'Cycle',
    icon: 'bicycle',
    color: EV.neon,
    desc: 'Eco-friendly',
    costPerKm: 0.5,   // ₱ per km (maintenance)
    emoji: '🚲',
  },
];

export default function TripIntroScreen() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState('ev');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    distanceKm: string;
    durationMin: number;
    cost: number;
  } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const mode = MODES.find(m => m.key === selectedMode)!;

  const handleCalculate = async () => {
    if (!origin.trim() || !destination.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const [from, to] = await Promise.all([geocode(origin), geocode(destination)]);
      const route = await getRoute(from, to);
      const dist = parseFloat(route.distanceKm);
      const cost = dist * mode.costPerKm;
      setResult({ distanceKm: route.distanceKm, durationMin: route.durationMin, cost });
    } catch (err) {
      console.log('Calculate error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGo = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash" size={16} color={EV.bg} />
          </View>
          <Text style={styles.logoText}>EVibe</Text>
        </View>
        <Text style={styles.headerSub}>How are you traveling today?</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Mode selector */}
        <View style={styles.modeGrid}>
          {MODES.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.modeCard, selectedMode === m.key && { borderColor: m.color, backgroundColor: m.color + '15' }]}
              onPress={() => { setSelectedMode(m.key); setResult(null); }}
              activeOpacity={0.8}>
              <View style={[styles.modeIconWrap, { backgroundColor: m.color + '20' }, selectedMode === m.key && { backgroundColor: m.color }]}>
                <Ionicons name={m.icon as any} size={24} color={selectedMode === m.key ? EV.bg : m.color} />
              </View>
              <Text style={[styles.modeLabel, selectedMode === m.key && { color: m.color }]}>{m.label}</Text>
              <Text style={styles.modeDesc}>{m.desc}</Text>
              {selectedMode === m.key && (
                <View style={[styles.modeCheck, { backgroundColor: m.color }]}>
                  <Ionicons name="checkmark" size={10} color={EV.bg} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Route input */}
        <View style={styles.routeCard}>
          <Text style={styles.cardLabel}>PLAN YOUR ROUTE</Text>

          {/* Origin */}
          <View style={[styles.inputWrap, focusedField === 'origin' && styles.inputFocused]}>
            <View style={styles.dotA}><View style={styles.dotAInner} /></View>
            <TextInput
              style={styles.input}
              placeholder="Point A — Starting location"
              placeholderTextColor={EV.textDim}
              value={origin}
              onChangeText={v => { setOrigin(v); setResult(null); }}
              onFocus={() => setFocusedField('origin')}
              onBlur={() => setFocusedField(null)}
            />
            {origin ? <TouchableOpacity onPress={() => { setOrigin(''); setResult(null); }}>
              <Ionicons name="close-circle" size={16} color={EV.textDim} />
            </TouchableOpacity> : null}
          </View>

          {/* Connector */}
          <View style={styles.connector}>
            {[...Array(4)].map((_, i) => <View key={i} style={styles.connDot} />)}
          </View>

          {/* Destination */}
          <View style={[styles.inputWrap, focusedField === 'dest' && styles.inputFocused]}>
            <Ionicons name="location" size={16} color={EV.danger} />
            <TextInput
              style={styles.input}
              placeholder="Point B — Destination"
              placeholderTextColor={EV.textDim}
              value={destination}
              onChangeText={v => { setDestination(v); setResult(null); }}
              onFocus={() => setFocusedField('dest')}
              onBlur={() => setFocusedField(null)}
              onSubmitEditing={handleCalculate}
              returnKeyType="go"
            />
            {destination ? <TouchableOpacity onPress={() => { setDestination(''); setResult(null); }}>
              <Ionicons name="close-circle" size={16} color={EV.textDim} />
            </TouchableOpacity> : null}
          </View>

          {/* Calculate button */}
          <TouchableOpacity
            style={[styles.calcBtn, { backgroundColor: mode.color }, (!origin || !destination) && styles.calcBtnDisabled]}
            onPress={handleCalculate}
            disabled={loading || !origin || !destination}
            activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={EV.bg} />
              : <>
                  <Ionicons name="calculator-outline" size={17} color={EV.bg} />
                  <Text style={styles.calcBtnText}>Calculate Route & Cost</Text>
                </>}
          </TouchableOpacity>
        </View>

        {/* Result card */}
        {result && (
          <View style={[styles.resultCard, { borderColor: mode.color + '60' }]}>
            <View style={styles.resultGlow} />
            <View style={styles.resultHeader}>
              <Text style={styles.resultEmoji}>{mode.emoji}</Text>
              <View>
                <Text style={styles.resultMode}>{mode.label}</Text>
                <Text style={styles.resultRoute} numberOfLines={1}>{origin} → {destination}</Text>
              </View>
            </View>

            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <View style={[styles.resultStatIcon, { backgroundColor: EV.accent + '20' }]}>
                  <Ionicons name="speedometer-outline" size={18} color={EV.accent} />
                </View>
                <Text style={styles.resultStatVal}>{result.distanceKm} km</Text>
                <Text style={styles.resultStatLbl}>Distance</Text>
              </View>

              <View style={styles.resultStat}>
                <View style={[styles.resultStatIcon, { backgroundColor: EV.info + '20' }]}>
                  <Ionicons name="time-outline" size={18} color={EV.info} />
                </View>
                <Text style={styles.resultStatVal}>{result.durationMin} min</Text>
                <Text style={styles.resultStatLbl}>Duration</Text>
              </View>

              <View style={styles.resultStat}>
                <View style={[styles.resultStatIcon, { backgroundColor: mode.color + '20' }]}>
                  <Ionicons name="cash-outline" size={18} color={mode.color} />
                </View>
                <Text style={[styles.resultStatVal, { color: mode.color }]}>
                  {result.cost === 0 ? 'Free' : `₱${result.cost.toFixed(2)}`}
                </Text>
                <Text style={styles.resultStatLbl}>Est. Cost</Text>
              </View>
            </View>

            {/* Cost breakdown */}
            {result.cost > 0 && (
              <View style={styles.costBreakdown}>
                <Ionicons name="information-circle-outline" size={14} color={EV.textDim} />
                <Text style={styles.costBreakdownText}>
                  {result.distanceKm} km × ₱{mode.costPerKm}/km = ₱{result.cost.toFixed(2)}
                </Text>
              </View>
            )}

            {/* EV comparison if not EV mode */}
            {selectedMode !== 'ev' && (
              <View style={styles.evCompare}>
                <Ionicons name="flash" size={14} color={EV.primary} />
                <Text style={styles.evCompareText}>
                  Switch to EV: ₱{(parseFloat(result.distanceKm) * 2.5).toFixed(2)} + zero emissions
                </Text>
              </View>
            )}

            <TouchableOpacity style={[styles.goBtn, { backgroundColor: mode.color }]} onPress={handleGo} activeOpacity={0.85}>
              <Ionicons name="navigate" size={18} color={EV.bg} />
              <Text style={styles.goBtnText}>Open Map & Start Trip</Text>
              <View style={styles.goBtnArrow}>
                <Ionicons name="arrow-forward" size={14} color={EV.bg} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Skip */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleGo}>
          <Text style={styles.skipText}>Skip — Go to Map</Text>
          <Ionicons name="chevron-forward" size={14} color={EV.textDim} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },

  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: EV.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  logoIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: EV.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '900', color: EV.text, letterSpacing: 1 },
  headerSub: { fontSize: 14, color: EV.textMuted, fontWeight: '500' },

  scroll: { padding: 16 },

  // Mode grid
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  modeCard: {
    width: (width - 42) / 2,
    backgroundColor: EV.bgCard, borderRadius: 18,
    padding: 16, borderWidth: 2, borderColor: EV.border,
    position: 'relative',
  },
  modeIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  modeLabel: { fontSize: 14, fontWeight: '800', color: EV.text, marginBottom: 2 },
  modeDesc: { fontSize: 11, color: EV.textMuted },
  modeCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },

  // Route card
  routeCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: EV.border, marginBottom: 14,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginBottom: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: EV.bgSurface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: EV.border,
  },
  inputFocused: { borderColor: EV.primary, backgroundColor: EV.bgElevated },
  dotA: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: EV.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  dotAInner: { width: 5, height: 5, borderRadius: 3, backgroundColor: EV.primary },
  input: { flex: 1, color: EV.text, fontSize: 14 },
  connector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 6, paddingLeft: 16,
  },
  connDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: EV.border },
  calcBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, paddingVertical: 15, marginTop: 14,
  },
  calcBtnDisabled: { opacity: 0.4 },
  calcBtnText: { color: EV.bg, fontWeight: '800', fontSize: 15 },

  // Result card
  resultCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 18,
    borderWidth: 2, marginBottom: 14, overflow: 'hidden',
  },
  resultGlow: {
    position: 'absolute', top: -30, right: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: EV.primary + '10',
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  resultEmoji: { fontSize: 32 },
  resultMode: { fontSize: 16, fontWeight: '800', color: EV.text },
  resultRoute: { fontSize: 12, color: EV.textMuted, marginTop: 2, maxWidth: width - 120 },
  resultStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  resultStat: { alignItems: 'center', gap: 6 },
  resultStatIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultStatVal: { fontSize: 16, fontWeight: '800', color: EV.text },
  resultStatLbl: { fontSize: 10, color: EV.textMuted },
  costBreakdown: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: EV.bgSurface, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
  },
  costBreakdownText: { fontSize: 12, color: EV.textDim },
  evCompare: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: EV.primary + '15', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14,
    borderWidth: 1, borderColor: EV.primaryDark,
  },
  evCompareText: { fontSize: 12, color: EV.primary, fontWeight: '600' },
  goBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, paddingVertical: 15, position: 'relative',
  },
  goBtnText: { color: EV.bg, fontWeight: '800', fontSize: 15 },
  goBtnArrow: {
    position: 'absolute', right: 14,
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: EV.bg + '30', alignItems: 'center', justifyContent: 'center',
  },

  skipBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 14,
  },
  skipText: { fontSize: 14, color: EV.textDim },
});
