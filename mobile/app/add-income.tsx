import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addIncome } from '@/services/api';
import { NATURE as EV } from '@/constants/theme';

const CATEGORIES = [
  { label: '💼 Salary', value: 'salary' },
  { label: '🎓 Allowance', value: 'allowance' },
  { label: '🎁 Gift', value: 'gift' },
  { label: '📦 Other', value: 'other' },
];

export default function AddIncomeScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('salary');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!amount || isNaN(parseFloat(amount))) return Alert.alert('Error', 'Enter a valid amount');
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      if (!user.id) return Alert.alert('Error', 'Please login first');
      const payload = { userId: user.id, amount: parseFloat(amount), description, category, date: new Date() };
      const res = await addIncome(payload);
      Alert.alert('Success', 'Income added!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Income</Text>
      <Text style={styles.subtitle}>Record your earnings</Text>

      <Text style={styles.label}>CATEGORY</Text>
      <View style={styles.grid}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.chip, category === cat.value && styles.chipActive]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>AMOUNT (₱)</Text>
      <View style={styles.amountRow}>
        <Text style={styles.currency}>₱</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor={EV.textDim}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>DESCRIPTION</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Monthly salary"
        placeholderTextColor={EV.textDim}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.button} onPress={save} disabled={loading}>
        {loading ? <ActivityIndicator color={EV.bg} /> : <Text style={styles.buttonText}>Save Income</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: EV.bg },
  content: { padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  backText: { color: EV.primary, fontSize: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: EV.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: EV.textMuted, marginBottom: 28 },
  label: { color: EV.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip: { backgroundColor: EV.bgCard, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: EV.border },
  chipActive: { borderColor: EV.primary, backgroundColor: EV.bgSurface },
  chipText: { color: EV.textMuted, fontWeight: '600' },
  chipTextActive: { color: EV.primary },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: EV.bgCard, borderRadius: 12, borderWidth: 1, borderColor: EV.border, paddingHorizontal: 16, marginBottom: 16 },
  currency: { fontSize: 20, color: EV.textMuted, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, color: EV.text, fontSize: 20, fontWeight: '700', paddingVertical: 13 },
  input: { backgroundColor: EV.bgCard, color: EV.text, borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 15, borderWidth: 1, borderColor: EV.border },
  button: { backgroundColor: EV.primary, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  buttonText: { color: EV.bg, fontWeight: 'bold', fontSize: 16 },
});
