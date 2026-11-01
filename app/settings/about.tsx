import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { Logo } from '@/src/components/Logo';
import { Screen } from '@/src/components/Screen';
import { strings } from '@/src/strings';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen edges={['top', 'bottom']} background={colors.background}>
      <StatusBar style="dark" />
      <AppHeader
        title={strings.about.title}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/profile');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Logo size={72} />
          <Text style={styles.appName}>
            <Text style={styles.navy}>Ghana</Text>
            <Text style={styles.amber}>Alert</Text>
          </Text>
          <Text style={styles.version}>
            {strings.about.version} {version}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.body}>{strings.about.body}</Text>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.mission}>“{strings.about.mission}”</Text>
        </View>

        <Text style={styles.footer}>{strings.about.footer}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  appName: {
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.4,
  },
  navy: {
    color: colors.primary,
  },
  amber: {
    color: colors.accent,
  },
  version: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  missionCard: {
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  mission: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
