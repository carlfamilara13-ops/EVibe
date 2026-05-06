import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GG, EV } from '@/constants/theme';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isLight = GG.bg === '#F7FBF7' || GG.bg === '#F0F8FF' || GG.bg === '#FFFDF7';
const BaseTheme = isLight ? DefaultTheme : DarkTheme;
const EVTheme = {
  ...BaseTheme,
  colors: {
    ...BaseTheme.colors,
    primary: GG.primary,
    background: GG.bg,
    card: GG.bgCard,
    text: GG.text,
    border: GG.border,
  },
};

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  return (
    <ThemeProvider value={EVTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="trip-detail" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={GG.statusBar} />
    </ThemeProvider>
  );
}
