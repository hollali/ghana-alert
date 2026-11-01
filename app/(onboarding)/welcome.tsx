import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccraSkyline } from '@/src/components/Illustrations';
import { Logo } from '@/src/components/Logo';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { strings } from '@/src/strings';
import { useAuthStore } from '@/src/store/authStore';
import { colors, fonts } from '@/src/theme/tokens';

export default function WelcomeScreen() {
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const goToRegister = () => {
    completeOnboarding();
    router.replace('/(auth)/register');
  };

  const goToLogin = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient colors={['#DCEBFC', '#F4F9FF', '#FFFFFF']} style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <Logo size={64} />
            <Text style={styles.title}>
              <Text style={styles.navy}>Ghana</Text>
              <Text style={styles.amber}>Alert</Text>
            </Text>
            <Text style={styles.subtitle}>{strings.onboarding.subtitle}</Text>
          </View>

          <View style={styles.checklist}>
            {strings.onboarding.checklist.map((item) => (
              <View key={item} style={styles.checkRow}>
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.illustration} pointerEvents="none">
            <AccraSkyline />
          </View>

          <View style={styles.footer}>
            <PrimaryButton label={strings.onboarding.getStarted} onPress={goToRegister} />
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>{strings.onboarding.alreadyHaveAccount} </Text>
              <Pressable onPress={goToLogin} hitSlop={8} accessibilityRole="link">
                <Text style={styles.loginLink}>{strings.onboarding.logIn}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 56,
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 14,
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.4,
  },
  navy: {
    color: colors.primary,
  },
  amber: {
    color: colors.accent,
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 280,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
  },
  checklist: {
    marginTop: 32,
    marginHorizontal: 24,
    gap: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    color: '#334155',
  },
  illustration: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  loginPrompt: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  loginLink: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
});
