import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { EV } from '@/constants/theme';

const EVTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: EV.primary,
    background: EV.bg,
    card: EV.bgCard,
    text: EV.text,
    border: EV.border,
  },
};

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={EVTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
