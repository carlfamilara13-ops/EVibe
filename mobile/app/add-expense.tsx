import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';
import { addExpense } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = [
  { label: 'Charging', value: 'charging', icon: 'flash', color: EV.primary },
  { label: 'Food', value: 'food', icon: 'restaurant', color: EV.warning },
  { label: 'Stay', value: 'accommodation', icon: 'bed', color: EV.info },
  { label: 'Other', value: 'other', icon: 'ellipsis-horizontal', color: EV.textMuted },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('charging');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const selectedCat = CATEGORIES.find(c => c.value === category)!;

  const handleSave = async () => {
    if (!amount) return Alert.alert('Missing Amount', 'Please enter an amount');
    setLoading(true);
    try {
      const tripId = await AsyncStorage.getItem('currentTripId');
      await addExpense({ category, amount: parseFloat(amount), description, tripId });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={EV.textMuted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Amount hero */}
        <View style={styles.amountCard}>
          <View style={[styles.amountIcon, { backgroundColor: selectedCat.color + '20' }]}>
            <Ionicons name={selectedCat.icon as any} size={28} color={selectedCat.color} />
          </View>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountCurrency}>₱</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={EV.textDim}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoFocus
            />
          </View>
        </View>

        {/* Category */}
        <Text style={styles.sectionLabel}>CATEGORY</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.catBtn, category === cat.value && { backgroundColor: cat.color, borderColor: cat.color }]}
              onPress={() => setCategory(cat.value)}
              activeOpacity={0.8}>
              <Ionicons name={cat.icon as any} size={18} color={category === cat.value ? EV.bg : cat.color} />
              <Text style={[styles.catLabel, category === cat.value && { color: EV.bg }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <View style={[styles.inputWrap, focusedField === 'desc' && styles.inputWrapFocused]}>
          <Ionicons name="create-outline" size={18} color={focusedField === 'desc' ? EV.primary : EV.textDim} />
          <TextInput
            style={styles.input}
            placeholder="e.g. GreenCharge Hub"
            placeholderTextColor={EV.textDim}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setFocusedField('desc')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={EV.bg} />
            : <>
                <Ionicons name="checkmark-circle" size={20} color={EV.bg} />
                <Text style={styles.saveBtnText}>Save Expense</Text>
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
  scroll: { padding: 16 },
  amountCard: {
    backgroundColor: EV.bgCard, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8, marginBottom: 24,
    borderWidth: 1, borderColor: EV.border,
  },
  amountIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  amountLabel: { fontSize: 10, color: EV.textMuted, fontWeight: '700', letterSpacing: 1.5 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  amountCurrency: { fontSize: 32, color: EV.textMuted, fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: '900', color: EV.text, minWidth: 120, textAlign: 'center' },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: EV.primary, letterSpacing: 1.5, marginBottom: 12 },
  catGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  catBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center', gap: 6,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: EV.bgCard, borderWidth: 1, borderColor: EV.border,
  },
  catLabel: { fontSize: 11, fontWeight: '700', color: EV.textMuted },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: EV.bgSurface, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: EV.border, marginBottom: 24,
  },
  inputWrapFocused: { borderColor: EV.primary },
  input: { flex: 1, color: EV.text, fontSize: 15 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: EV.primary, borderRadius: 14, paddingVertical: 16,
  },
  saveBtnText: { color: EV.bg, fontWeight: '800', fontSize: 16 },
});
