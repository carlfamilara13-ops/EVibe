import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, TextInput, Modal, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EV } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addExpense as apiAddExpense, getTripExpenses, deleteExpense as apiDeleteExpense } from '@/services/api';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'charging', label: 'Charging', icon: 'flash', color: EV.primary },
  { key: 'food', label: 'Food', icon: 'restaurant', color: EV.warning },
  { key: 'accommodation', label: 'Stay', icon: 'bed', color: EV.info },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: EV.textMuted },
];

type Expense = { id: string; category: string; label: string; amount: number; time: string };

export default function BudgetScreen() {
  const [budget] = useState(80);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tripId, setTripId] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState('charging');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const trip = await AsyncStorage.getItem('activeTrip');
      if (!trip) return;
      const parsed = JSON.parse(trip);
      setTripId(parsed._id);
      const res = await getTripExpenses(parsed._id);
      const mapped = res.data.map((e: any) => ({
        id: e._id,
        category: e.category,
        label: e.description,
        amount: e.amount,
        time: new Date(e.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      }));
      setExpenses(mapped);
    } catch (err) {
      console.log('No active trip found');
    }
  };

  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = budget - spent;
  const progress = Math.min(spent / budget, 1);
  const isOver = remaining < 0;
  const progressColor = progress > 0.85 ? EV.danger : progress > 0.6 ? EV.warning : EV.primary;

  const catTotal = (key: string) => expenses.filter(e => e.category === key).reduce((s, e) => s + e.amount, 0);
  const getCat = (key: string) => CATEGORIES.find(c => c.key === key)!;

  const addExpense = async () => {
    if (!newLabel || !newAmount) return;
    if (!tripId) return Alert.alert('No active trip', 'Start a trip first');
    try {
      const res = await apiAddExpense({
        tripId,
        category: newCat,
        description: newLabel,
        amount: parseFloat(newAmount),
      });
      setExpenses(prev => [...prev, {
        id: res.data._id,
        category: newCat,
        label: newLabel,
        amount: parseFloat(newAmount),
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setNewLabel('');
      setNewAmount('');
      setModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Budget Tracker</Text>
          <Text style={styles.headerSub}>Track your trip expenses</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Ionicons name="add" size={22} color={EV.bg} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Overview hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>TOTAL BUDGET</Text>
              <Text style={styles.heroBudget}>${budget.toFixed(2)}</Text>
            </View>
            <View style={[styles.remainBox, isOver && styles.remainBoxOver]}>
              <Text style={[styles.remainLabel, isOver && { color: EV.danger }]}>
                {isOver ? 'Over by' : 'Left'}
              </Text>
              <Text style={[styles.remainAmount, isOver && { color: EV.danger }]}>
                ${Math.abs(remaining).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Big progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: progressColor }]}>
              <View style={[styles.progressGlow, { backgroundColor: progressColor }]} />
            </View>
          </View>

          <View style={styles.progressMeta}>
            <Text style={styles.progressMetaText}>
              <Text style={{ color: progressColor, fontWeight: '700' }}>${spent.toFixed(2)}</Text>
              {' '}spent of ${budget}
            </Text>
            <Text style={styles.progressMetaPct}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>

        {/* Category cards */}
        <Text style={styles.sectionTitle}>BY CATEGORY</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map(cat => {
            const total = catTotal(cat.key);
            const pct = budget > 0 ? Math.min(total / budget, 1) : 0;
            const count = expenses.filter(e => e.category === cat.key).length;
            return (
              <View key={cat.key} style={styles.catCard}>
                <View style={styles.catCardTop}>
                  <View style={[styles.catIconBox, { backgroundColor: cat.color + '18' }]}>
                    <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                  </View>
                  <Text style={styles.catCount}>{count} items</Text>
                </View>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <Text style={[styles.catAmount, { color: cat.color }]}>${total.toFixed(2)}</Text>
                <View style={styles.catTrack}>
                  <View style={[styles.catFill, { width: `${pct * 100}%` as any, backgroundColor: cat.color }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Expense list */}
        <View style={styles.expenseHeader}>
          <Text style={styles.sectionTitle}>EXPENSES</Text>
          <Text style={styles.expenseCount}>{expenses.length} total</Text>
        </View>

        {[...expenses].reverse().map((exp, i) => {
          const cat = getCat(exp.category);
          return (
            <View key={exp.id} style={[styles.expRow, i === 0 && styles.expRowFirst]}>
              <View style={[styles.expIconBox, { backgroundColor: cat.color + '18' }]}>
                <Ionicons name={cat.icon as any} size={18} color={cat.color} />
              </View>
              <View style={styles.expInfo}>
                <Text style={styles.expLabel}>{exp.label}</Text>
                <View style={styles.expMeta}>
                  <View style={[styles.expCatChip, { backgroundColor: cat.color + '18' }]}>
                    <Text style={[styles.expCatText, { color: cat.color }]}>{cat.label}</Text>
                  </View>
                  <Text style={styles.expTime}>{exp.time}</Text>
                </View>
              </View>
              <Text style={styles.expAmount}>-${exp.amount.toFixed(2)}</Text>
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setModal(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add Expense</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModal(false)}>
                <Ionicons name="close" size={18} color={EV.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.catPicker}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.catChip, newCat === cat.key && { backgroundColor: cat.color, borderColor: cat.color }]}
                  onPress={() => setNewCat(cat.key)}>
                  <Ionicons name={cat.icon as any} size={14} color={newCat === cat.key ? EV.bg : cat.color} />
                  <Text style={[styles.catChipText, newCat === cat.key && { color: EV.bg }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>DESCRIPTION</Text>
            <TextInput
              style={styles.field}
              placeholder="e.g. Lunch stop"
              placeholderTextColor={EV.textDim}
              value={newLabel}
              onChangeText={setNewLabel}
            />

            <Text style={styles.fieldLabel}>AMOUNT</Text>
            <View style={styles.amountField}>
              <Text style={styles.amountCurrency}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={EV.textDim}
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={addExpense}>
              <Ionicons name="checkmark-circle" size={18} color={EV.bg} />
              <Text style={styles.saveBtnText}>Save Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: EV.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCard: {
    margin: 16,
    backgroundColor: EV.bgCard,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: EV.border,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: EV.primary + '0C',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heroLabel: { fontSize: 10, color: EV.textMuted, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  heroBudget: { fontSize: 34, fontWeight: '900', color: EV.text },
  remainBox: {
    backgroundColor: EV.bgSurface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: EV.primaryDark,
    minWidth: 90,
  },
  remainBoxOver: { borderColor: EV.danger },
  remainLabel: { fontSize: 11, color: EV.textMuted, fontWeight: '600', marginBottom: 2 },
  remainAmount: { fontSize: 20, fontWeight: '900', color: EV.primary },
  progressTrack: {
    height: 12,
    backgroundColor: EV.bgSurface,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 6, position: 'relative' },
  progressGlow: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 20, opacity: 0.5, borderRadius: 6 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  progressMetaText: { fontSize: 12, color: EV.textMuted },
  progressMetaPct: { fontSize: 12, color: EV.textMuted, fontWeight: '700' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: EV.primary,
    letterSpacing: 1.5,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 10, marginBottom: 24 },
  catCard: {
    width: (width - 44) / 2,
    backgroundColor: EV.bgCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: EV.border,
    gap: 6,
  },
  catCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  catIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catCount: { fontSize: 10, color: EV.textDim, fontWeight: '600' },
  catLabel: { fontSize: 13, color: EV.textMuted, fontWeight: '600' },
  catAmount: { fontSize: 22, fontWeight: '900' },
  catTrack: { height: 4, backgroundColor: EV.bgSurface, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  catFill: { height: '100%', borderRadius: 2 },

  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  expenseCount: { fontSize: 12, color: EV.textMuted },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: EV.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: EV.border,
  },
  expRowFirst: { borderColor: EV.border },
  expIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expInfo: { flex: 1 },
  expLabel: { fontSize: 14, fontWeight: '700', color: EV.text, marginBottom: 5 },
  expMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expCatChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  expCatText: { fontSize: 10, fontWeight: '700' },
  expTime: { fontSize: 11, color: EV.textDim },
  expAmount: { fontSize: 16, fontWeight: '800', color: EV.danger },

  // Modal
  overlay: { flex: 1, justifyContent: 'flex-end' },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000BB' },
  sheet: {
    backgroundColor: EV.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: EV.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: EV.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: EV.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: EV.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: { fontSize: 10, color: EV.textMuted, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  catPicker: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: EV.bgSurface,
    borderWidth: 1,
    borderColor: EV.border,
  },
  catChipText: { fontSize: 13, color: EV.textMuted, fontWeight: '600' },
  field: {
    backgroundColor: EV.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: EV.border,
    color: EV.text,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EV.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: EV.border,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  amountCurrency: { fontSize: 20, color: EV.textMuted, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, color: EV.text, fontSize: 20, fontWeight: '700', paddingVertical: 13 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: EV.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveBtnText: { color: EV.bg, fontWeight: '800', fontSize: 16 },
});
