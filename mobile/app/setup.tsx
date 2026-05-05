import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';
import { createTrip } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SetupScreen() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleStart = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');
      const res = await createTrip({ userId: user.id, origin, destination, budget: parseFloat(budget) || 0 });
      await AsyncStorage.setItem('currentTripId', res.data._id);
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'origin', label: 'Starting Point', icon: 'radio-button-on', placeholder: 'e.g. Manila', value: origin, set: setOrigin, color: EV.primary },
    { key: 'destination', label: 'Destination', icon: 'location', placeholder: 'e.g. Quezon City', value: destination, set: setDestination, color: EV.danger },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={EV.textMuted} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Plan Your Trip</Text>
          <Text style={styles.headerSub}>Enter your trip details</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Route card */}
        <View style={styles.routeCard}>
          <Text style={styles.cardLabel}>ROUTE</Text>

          {fields.map((f, i) => (
            <View key={f.key}>
              <View style={[styles.inputWrap, focusedField === f.key && styles.inputWrapFocused]}>
                <Ionicons name={f.icon as any} size={18} color={f.color} />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={EV.textDim}
                  value={f.value}
                  onChangeText={f.set}
                  onFocus={() => setFocusedField(f.key)}
                  onBlur={() => setFocusedField(null)}
                />
                {f.value ? (
                  <TouchableOpacity onPress={() => f.set('')}>
                    <Ionicons name="close-circle" size={16} color={EV.textDim} />
                  </TouchableOpacity>
                ) : null}
              </View>
              {i === 0 && (
                <View style={styles.routeConnector}>
                  {[...Array(3)].map((_, j) => (
                    <View key={j} style={styles.connectorDot} />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Budget */}
        <View style={styles.budgetCard}>
          <Text style={styles.cardLabel}>TRIP BUDGET</Text>
          <View style={[styles.inputWrap, focusedField === 'budget' && styles.inputWrapFocused]}>
            <Ionicons name="wallet-outline" size={18} color={focusedField === 'budget' ? EV.primary : EV.textDim} />
            <Text style={styles.currencySymbol}>₱</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={EV.textDim}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              onFocus={() => setFocusedField('budget')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* Trip estimate */}
        <View style={styles.estimateCard}>
          <Text style={styles.cardLabel}>ESTIMATED DETAILS</Text>
          <View style={styles.estimateGrid}>
            {[
              { icon: 'speedometer-outline', label: 'Distance', value: origin && destination ? '~15 km' : '--', color: EV.accent },
              { icon: 'time-outline', label: 'Duration', value: origin && destination ? '~25 min' : '--', color: EV.info },
              { icon: 'flash-outline', label: 'Energy', value: origin && destination ? '~3 kWh' : '--', color: EV.primary },
              { icon: 'leaf-outline', label: 'CO₂ Saved', value: origin && destination ? '~2.1 kg' : '--', color: EV.neon },
            ].map(e => (
              <View key={e.label} style={styles.estimateItem}>
                <View style={[styles.estimateIcon, { backgroundColor: e.color + '20' }]}>
                  <Ionicons name={e.icon as any} size={18} color={e.color} />
                </View>
                <Text style={[styles.estimateVal, { color: e.color }]}>{e.value}</Text>
                <Text style={styles.estimateLbl}>{e.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startBtn, (!origin || !destination) && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={loading || !origin || !destination}
          activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={EV.bg} />
            : <>
                <Ionicons name="navigate" size={20} color={EV.bg} />
                <Text style={styles.startBtnText}>Start Trip</Text>
                <View style={styles.startBtnArrow}>
                  <Ionicons name="arrow-forward" size={16} color={EV.bg} />
                </View>
              </>}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
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
  scroll: { padding: 16 },
  routeCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: EV.border, marginBottom: 14,
  },
  budgetCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: EV.border, marginBottom: 14,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginBottom: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: EV.bgSurface, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: EV.border,
  },
  inputWrapFocused: { borderColor: EV.primary, backgroundColor: EV.bgElevated },
  input: { flex: 1, color: EV.text, fontSize: 15 },
  currencySymbol: { fontSize: 16, color: EV.textMuted, fontWeight: '700' },
  routeConnector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 6, paddingLeft: 18,
  },
  connectorDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: EV.border },
  estimateCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: EV.border, marginBottom: 20,
  },
  estimateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  estimateItem: {
    width: '47%', backgroundColor: EV.bgSurface, borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: EV.border,
  },
  estimateIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  estimateVal: { fontSize: 16, fontWeight: '800' },
  estimateLbl: { fontSize: 11, color: EV.textMuted },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: EV.primary, borderRadius: 16, paddingVertical: 18, position: 'relative',
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: EV.bg, fontWeight: '800', fontSize: 17 },
  startBtnArrow: {
    position: 'absolute', right: 18,
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: EV.bg + '30', alignItems: 'center', justifyContent: 'center',
  },
});
