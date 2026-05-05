import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { login } from '@/services/api';
import { EV } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Missing Fields', 'Please fill in all fields');
    setLoading(true);
    try {
      const res = await login(email, password);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={EV.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>

        {/* Background glow */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.container}>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Ionicons name="flash" size={32} color={EV.bg} />
            </View>
            <Text style={styles.logoText}>EVibe</Text>
            <Text style={styles.logoTagline}>Smart EV Trip Planner</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to continue your journey</Text>

            {/* Email */}
            <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
              <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? EV.primary : EV.textDim} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={EV.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
              <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? EV.primary : EV.textDim} />
              <TextInput
                style={styles.input}
                placeholder="Password"
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

            {/* Login button */}
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color={EV.bg} />
                : <>
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color={EV.bg} />
                  </>}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign up */}
            <TouchableOpacity style={styles.signupBtn} onPress={() => router.push('/signup')} activeOpacity={0.8}>
              <Text style={styles.signupBtnText}>Create new account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons name="leaf" size={14} color={EV.textDim} />
            <Text style={styles.footerText}>Drive green. Save the planet.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: EV.bg },
  kav: { flex: 1 },
  glowTop: {
    position: 'absolute', top: -100, left: '50%', marginLeft: -150,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: EV.primary + '12',
  },
  glowBottom: {
    position: 'absolute', bottom: -80, right: -80,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: EV.primaryDeep + '10',
  },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: EV.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: EV.primary, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  logoText: { fontSize: 36, fontWeight: '900', color: EV.text, letterSpacing: 2 },
  logoTagline: { fontSize: 13, color: EV.textMuted, marginTop: 4, fontWeight: '500' },
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
    borderWidth: 1, borderColor: EV.border, marginBottom: 14,
  },
  inputWrapFocused: { borderColor: EV.primary, backgroundColor: EV.bgElevated },
  input: { flex: 1, color: EV.text, fontSize: 15 },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: EV.primary, borderRadius: 14,
    paddingVertical: 16, marginTop: 4, marginBottom: 20,
  },
  loginBtnText: { color: EV.bg, fontWeight: '800', fontSize: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: EV.border },
  dividerText: { fontSize: 12, color: EV.textDim },
  signupBtn: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: EV.border, backgroundColor: EV.bgSurface,
  },
  signupBtnText: { color: EV.textMuted, fontWeight: '600', fontSize: 15 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32 },
  footerText: { fontSize: 12, color: EV.textDim },
});
