import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { register } from '@/services/api';
import { EV } from '@/constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Missing Fields', 'Please fill in all fields');
    if (password.length < 6) return Alert.alert('Weak Password', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await register(name, email, password);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      router.replace('/trip-intro');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', icon: 'person-outline', value: name, set: setName, type: 'default', secure: false },
    { key: 'email', label: 'Email address', icon: 'mail-outline', value: email, set: setEmail, type: 'email-address', secure: false },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.glowTop} />

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* Back + Logo */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={EV.textMuted} />
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Ionicons name="flash" size={28} color={EV.bg} />
            </View>
            <Text style={styles.logoText}>EVibe</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create account</Text>
            <Text style={styles.cardSub}>Join the green driving revolution</Text>

            {fields.map(f => (
              <View key={f.key} style={[styles.inputWrap, focusedField === f.key && styles.inputWrapFocused]}>
                <Ionicons name={f.icon as any} size={18} color={focusedField === f.key ? EV.primary : EV.textDim} />
                <TextInput
                  style={styles.input}
                  placeholder={f.label}
                  placeholderTextColor={EV.textDim}
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.type as any}
                  autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                  onFocus={() => setFocusedField(f.key)}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            ))}

            {/* Password */}
            <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
              <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? EV.primary : EV.textDim} />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 chars)"
                placeholderTextColor={EV.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={EV.textDim} />
              </TouchableOpacity>
            </View>

            {/* Benefits */}
            <View style={styles.benefits}>
              {['Track your carbon footprint', 'Find EV stations on the go', 'Monitor trip budget'].map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color={EV.bg} />
                : <>
                    <Text style={styles.registerBtnText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={18} color={EV.bg} />
                  </>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
              <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: EV.primary, fontWeight: '700' }}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  glowTop: {
    position: 'absolute', top: -80, left: '50%', marginLeft: -120,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: EV.primary + '10',
  },
  container: { paddingHorizontal: 24, paddingTop: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: EV.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: EV.border, marginBottom: 24,
  },
  logoSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: EV.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 28, fontWeight: '900', color: EV.text, letterSpacing: 1 },
  card: {
    backgroundColor: EV.bgCard, borderRadius: 24,
    padding: 24, borderWidth: 1, borderColor: EV.border,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: EV.text, marginBottom: 4 },
  cardSub: { fontSize: 13, color: EV.textMuted, marginBottom: 24 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: EV.bgSurface, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: EV.border, marginBottom: 12,
  },
  inputWrapFocused: { borderColor: EV.primary, backgroundColor: EV.bgElevated },
  input: { flex: 1, color: EV.text, fontSize: 15 },
  benefits: {
    backgroundColor: EV.bgSurface, borderRadius: 14,
    padding: 14, marginBottom: 20, gap: 8,
    borderWidth: 1, borderColor: EV.border,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: EV.primary },
  benefitText: { fontSize: 13, color: EV.textMuted },
  registerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: EV.primary, borderRadius: 14,
    paddingVertical: 16, marginBottom: 16,
  },
  registerBtnText: { color: EV.bg, fontWeight: '800', fontSize: 16 },
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: EV.textMuted },
});
