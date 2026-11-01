import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { faqs } from '@/src/data/user';
import { strings } from '@/src/strings';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';

export default function HelpScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Screen edges={['top', 'bottom']} background={colors.background}>
      <StatusBar style="dark" />
      <AppHeader
        title={strings.help.title}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/profile');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{strings.help.intro}</Text>

        <View style={styles.card}>
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <View key={faq.question}>
                {index > 0 && <View style={styles.divider} />}
                <Pressable
                  onPress={() => setOpenIndex(open ? null : index)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={faq.question}
                  style={({ pressed }) => [styles.questionRow, pressed && styles.pressed]}
                >
                  <Text style={styles.question}>{faq.question}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
                {open && <Text style={styles.answer}>{faq.answer}</Text>}
              </View>
            );
          })}
        </View>

        <View style={[styles.card, styles.contactCard]}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.contactTexts}>
            <Text style={styles.contactTitle}>{strings.help.contact}</Text>
            <Text style={styles.contactBody}>{strings.help.contactBody}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => void Linking.openURL('mailto:support@ghanaalert.app')}
          accessibilityRole="link"
          accessibilityLabel="Email support@ghanaalert.app"
          style={({ pressed }) => [styles.emailButton, pressed && styles.pressed]}
        >
          <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
          <Text style={styles.emailButtonText}>support@ghanaalert.app</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
    gap: 14,
  },
  intro: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...cardShadow,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  questionRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  question: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  answer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTexts: {
    flex: 1,
    gap: 4,
  },
  contactTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  contactBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  emailButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  emailButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.75,
  },
});
