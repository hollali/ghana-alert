import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { Logo } from '@/src/components/Logo';
import { Screen } from '@/src/components/Screen';
import { strings } from '@/src/strings';
import { colors, fonts } from '@/src/theme/tokens';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <Screen edges={['top', 'bottom']} background={colors.surface}>
      <AppHeader showBack={router.canGoBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Logo size={56} />
            <Text style={styles.appName}>
              <Text style={styles.navy}>Ghana</Text>
              <Text style={styles.amber}>Alert</Text>
            </Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.form}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  appName: {
    marginTop: 8,
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  navy: {
    color: colors.primary,
  },
  amber: {
    color: colors.accent,
  },
  title: {
    marginTop: 18,
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 300,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  form: {
    marginTop: 28,
    gap: 16,
  },
  footer: {
    marginTop: 20,
    gap: 14,
    alignItems: 'center',
  },
});

export const authStyles = StyleSheet.create({
  demo: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  link: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
});

export const authDemoNote = strings.auth.demoNote;
