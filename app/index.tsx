import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhanaFlagRibbon } from '@/src/components/Illustrations';
import { strings } from '@/src/strings';
import { useAuthStore } from '@/src/store/authStore';
import { colors, fonts } from '@/src/theme/tokens';

export default function SplashRoute() {
  const insets = useSafeAreaInsets();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);
  const hasRedirected = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasRedirected.current) {
        if (isLoggedIn) router.replace('/(tabs)');
        else if (!hasSeenOnboarding) router.replace('/(onboarding)/welcome');
        else router.replace('/(auth)/login');
        return;
      }
      hasRedirected.current = true;
      const timer = setTimeout(() => {
        if (isLoggedIn) {
          router.replace('/(tabs)');
        } else if (!hasSeenOnboarding) {
          router.replace('/(onboarding)/welcome');
        } else {
          router.replace('/(auth)/login');
        }
      }, 1600);

      return () => clearTimeout(timer);
    }, [isLoggedIn, hasSeenOnboarding]),
  );

  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.splashImage}
          resizeMode="contain"
          accessibilityLabel="GhanaAlert"
        />
        <Text style={styles.wordmark}>
          <Text style={styles.white}>Ghana</Text>
          <Text style={styles.amber}>Alert</Text>
        </Text>
        <View style={styles.taglineWrap}>
          <Text style={styles.tagline}>{strings.tagline[0]}</Text>
          <Text style={styles.tagline}>{strings.tagline[1]}</Text>
        </View>
      </View>

      <GhanaFlagRibbon height={250} />

      <Text
        style={[styles.footer, { bottom: insets.bottom + 20 }]}
        accessibilityRole="text"
      >
        {strings.splashFooter}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: '30%',
  },
  splashImage: {
    width: 160,
    height: 160,
  },
  wordmark: {
    marginTop: 18,
    fontFamily: fonts.bold,
    fontSize: 34,
    letterSpacing: -0.5,
  },
  white: {
    color: '#FFFFFF',
  },
  amber: {
    color: colors.accent,
  },
  taglineWrap: {
    marginTop: 12,
    alignItems: 'center',
    gap: 2,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 32,
    right: 32,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
