import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Dimensions, ScrollView,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register } from '@/services/api';
import { GG } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const ONBOARDING = [
  {
    icon: 'bus',
    emoji: '🚌',
    title: 'Commute Smarter',
    subtitle: 'Discover the best public transport routes tailored just for you — faster, cheaper, greener.',
    color: GG.primary,
    bg: GG.bgSurface,
  },
  {
    icon: 'leaf',
    emoji: '🌿',
    title: 'Reduce Your Carbon',
    subtitle: 'Every commute you take instead of driving saves CO₂. Track your impact and help the planet.',
    color: GG.accent,
    bg: GG.bgElevated,
  },
  {
    icon: 'wallet',
    emoji: '💰',
    title: 'Save More Money',
    subtitle: 'Track your transport spending, set budgets, and see how much you save by going green.',
    color: GG.info,
    bg: GG.bgSurface,
  },
];

export default function LoginScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<'onboarding' | 'login' | 'signup'>('onboarding');
  const [onboardPage, setOnboardPage] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToPage = (page: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setOnboardPage(page);
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Oops!', 'Please fill in all fields');
    if (screen === 'signup' && !name) return Alert.alert('Oops!', 'Please enter your name');
    setLoading(true);
    try {
      const res = screen === 'login'
        ? await login(email, password)
        : await register(name, email, password);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || 'Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  const current = ONBOARDING[onboardPage];
  const isLight = GG.bg === '#F7FBF7' || GG.bg === '#F0F8FF' || GG.bg === '#FFFDF7';

  if (screen === 'onboarding') {
    return (
      <View style={[styles.container, { backgroundColor: GG.bg }]}>
        <StatusBar style={GG.statusBar} />

        {/* Skip */}
        <TouchableOpacity style={styles.skipBtn} onPress={() => setScreen('login')}>
          <Text style={[styles.skipText, { color: GG.textMuted }]}>Skip</Text>
        </TouchableOpacity>

        {/* Illustration area */}
        <Animated.View style={[styles.illustrationArea, { opacity: fadeAnim, backgroundColor: current.bg }]}>
          <View style={[styles.iconCircleOuter, { backgroundColor: current.color + '18' }]}>
            <View style={[styles.iconCircleInner, { backgroundColor: current.color + '30' }]}>
              <Text style={styles.emoji}>{current.emoji}</Text>
            </View>
          </View>

          {/* Floating decorations */}
          <View style={[styles.floatDot, { top: 40, right: 60, backgroundColor: current.color + '40', width: 12, height: 12 }]} />
          <View style={[styles.floatDot, { top: 80, left: 50, backgroundColor: GG.accent + '50', width: 8, height: 8 }]} />
          <View style={[styles.floatDot, { bottom: 60, right: 40, backgroundColor: current.color + '30', width: 16, height: 16 }]} />
          <View style={[styles.floatDot, { bottom: 40, left: 70, backgroundColor: GG.accent + '40', width: 10, height: 10 }]} />
        </Animated.View>

        {/* Content */}
        <View style={styles.onboardContent}>
          {/* App name */}
          <View style={styles.appNameRow}>
            <View style={[styles.appDot, { backgroundColor: GG.primary }]} />
            <Text style={[styles.appName, { color: GG.primary }]}>GoGreen</Text>
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.onboardTitle, { color: GG.text }]}>{current.title}</Text>
            <Text style={[styles.onboardSubtitle, { color: GG.textMuted }]}>{current.subtitle}</Text>
          </Animated.View>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {ONBOARDING.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goToPage(i)}>
                <View style={[
                  styles.dot,
                  { backgroundColor: i === onboardPage ? GG.primary : GG.border },
                  i === onboardPage && styles.dotActive,
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Next / Get Started */}
          {onboardPage < ONBOARDING.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: GG.primary }]}
              onPress={() => goToPage(onboardPage + 1)}
            >
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color={GG.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.authBtns}>
              <TouchableOpacity
                style={[styles.getStartedBtn, { backgroundColor: GG.primary }]}
                onPress={() => setScreen('login')}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signInBtn, { borderColor: GG.primary }]}
                onPress={() => setScreen('login')}
              >
                <Text style={[styles.signInText, { color: GG.primary }]}>I have an account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: GG.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={GG.statusBar} />
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.authHeader}>
          <View style={[styles.logoBox, { backgroundColor: GG.primary }]}>
            <Ionicons name="leaf" size={28} color={GG.white} />
          </View>
          <Text style={[styles.logoText, { color: GG.text }]}>GoGreen</Text>
          <Text style={[styles.logoTagline, { color: GG.textMuted }]}>Commute. Save. Sustain.</Text>
        </View>

        {/* Card */}
        <View style={[styles.authCard, { backgroundColor: GG.bgCard, borderColor: GG.border }]}>
          <Text style={[styles.authTitle, { color: GG.text }]}>
            {screen === 'login' ? 'Welcome back 👋' : 'Join GoGreen 🌿'}
          </Text>
          <Text style={[styles.authSubtitle, { color: GG.textMuted }]}>
            {screen === 'login' ? 'Sign in to continue your green journey' : 'Start your sustainable commute today'}
          </Text>

          {screen === 'signup' && (
            <View style={[styles.inputBox, { backgroundColor: GG.bgSurface, borderColor: GG.border }]}>
              <Ionicons name="person-outline" size={18} color={GG.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: GG.text }]}
                placeholder="Full name"
                placeholderTextColor={GG.textDim}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={[styles.inputBox, { backgroundColor: GG.bgSurface, borderColor: GG.border }]}>
            <Ionicons name="mail-outline" size={18} color={GG.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: GG.text }]}
              placeholder="Email address"
              placeholderTextColor={GG.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputBox, { backgroundColor: GG.bgSurface, borderColor: GG.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={GG.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: GG.text }]}
              placeholder="Password"
              placeholderTextColor={GG.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={GG.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.authBtn, { backgroundColor: GG.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={GG.white} />
              : <Text style={styles.authBtnText}>{screen === 'login' ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: GG.border }]} />
            <Text style={[styles.dividerText, { color: GG.textDim }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: GG.border }]} />
          </View>

          {/* Toggle */}
          <TouchableOpacity
            style={[styles.toggleBtn, { borderColor: GG.border }]}
            onPress={() => setScreen(screen === 'login' ? 'signup' : 'login')}
          >
            <Text style={[styles.toggleText, { color: GG.textMuted }]}>
              {screen === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={[styles.toggleBold, { color: GG.primary }]}>
                {screen === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats teaser */}
        <View style={styles.statsRow}>
          {[
            { icon: '🌍', value: '2.4M', label: 'kg CO₂ saved' },
            { icon: '🚌', value: '180K', label: 'commutes tracked' },
            { icon: '💚', value: '50K+', label: 'green commuters' },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, { backgroundColor: GG.bgCard, borderColor: GG.border }]}>
              <Text style={styles.statEmoji}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: GG.primary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: GG.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => setScreen('onboarding')} style={styles.backToOnboard}>
          <Text style={[styles.backToOnboardText, { color: GG.textDim }]}>← Back to intro</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Onboarding
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10, padding: 8 },
  skipText: { fontSize: 14, fontWeight: '600' },
  illustrationArea: { height: height * 0.42, width, alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  iconCircleOuter: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center' },
  iconCircleInner: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64 },
  floatDot: { position: 'absolute', borderRadius: 50 },
  onboardContent: { flex: 1, paddingHorizontal: 28, paddingTop: 32 },
  appNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  appDot: { width: 8, height: 8, borderRadius: 4 },
  appName: { fontSize: 13, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  onboardTitle: { fontSize: 30, fontWeight: '900', marginBottom: 12, lineHeight: 36 },
  onboardSubtitle: { fontSize: 15, lineHeight: 24, marginBottom: 32 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32 },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  authBtns: { gap: 12 },
  getStartedBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  getStartedText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  signInBtn: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', borderWidth: 1.5 },
  signInText: { fontWeight: '700', fontSize: 15 },

  // Auth
  authScroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  authHeader: { alignItems: 'center', marginBottom: 28 },
  logoBox: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  logoTagline: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  authCard: { borderRadius: 24, padding: 24, borderWidth: 1, marginBottom: 20 },
  authTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  authSubtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, marginBottom: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  authBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  authBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '600' },
  toggleBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  toggleText: { fontSize: 14 },
  toggleBold: { fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statItem: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1 },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 15, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  backToOnboard: { alignItems: 'center', paddingVertical: 8 },
  backToOnboardText: { fontSize: 13 },
});
