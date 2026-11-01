import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useHydration } from '@/src/hooks/useHydration';
import { useNotificationRouting } from '@/src/hooks/useNotificationRouting';
import { useAuthStore } from '@/src/store/authStore';
import { colors } from '@/src/theme/tokens';
import { configureNotifications } from '@/src/utils/notifications';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

configureNotifications();
void SplashScreen.preventAutoHideAsync().catch(() => {});

const protectedRoots = new Set([
  '(tabs)',
  'alert',
  'category',
  'saved',
  'report',
  'settings',
]);

function AuthGuard() {
  const segments = useSegments();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);
  const root = segments[0];

  useEffect(() => {
    if (!root) return;

    if (!isLoggedIn && protectedRoots.has(root)) {
      router.replace(hasSeenOnboarding ? '/(auth)/login' : '/(onboarding)/welcome');
      return;
    }

    if (isLoggedIn && (root === '(auth)' || root === '(onboarding)')) {
      router.replace('/(tabs)');
    }
  }, [root, isLoggedIn, hasSeenOnboarding]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const hydrated = useHydration();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (!fontsLoaded || !hydrated) return;
    const timeout = setTimeout(() => {
      void SplashScreen.hideAsync().catch(() => {});
    }, Platform.OS === 'web' ? 0 : 300);
    return () => clearTimeout(timeout);
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <AuthGuard />
      <NotificationsBridge />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="(tabs)"
          options={{ animation: 'fade', gestureEnabled: false }}
        />
      </Stack>
    </>
  );
}

function NotificationsBridge() {
  useNotificationRouting(true);
  return null;
}
