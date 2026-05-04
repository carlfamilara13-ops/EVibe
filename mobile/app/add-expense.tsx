import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  { label: '⚡ Charging', value: 'charging' },
  { label: '🍔 Food', value: 'food' },
  { label: '🏨 Accommodation', value: 'accommodation' },
  { label: '📦 Other', value: 'other' },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('charging');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Expense</Text>
      <Text style={styles.subtitle}>Track your trip spending</Text>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.categoryBtn, category === cat.value && styles.categoryBtnActive]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={[styles.categoryText, category === cat.value && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Amount (RM)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor="#64748b"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Shell Recharge Station"
        placeholderTextColor="#64748b"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Save Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  backText: { color: '#22c55e', fontSize: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 28 },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 10, marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  categoryBtn: { backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#1e293b' },
  categoryBtnActive: { borderColor: '#22c55e', backgroundColor: '#14532d' },
  categoryText: { color: '#94a3b8', fontWeight: '600' },
  categoryTextActive: { color: '#22c55e' },
  input: { backgroundColor: '#1e293b', color: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 15 },
  button: { backgroundColor: '#22c55e', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
