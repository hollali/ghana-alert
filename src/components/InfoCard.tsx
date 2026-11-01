import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';

interface InfoCardProps {
  title: string;
  children: ReactNode;
  tone?: 'default' | 'info';
  style?: StyleProp<ViewStyle>;
}

export function InfoCard({ title, children, tone = 'default', style }: InfoCardProps) {
  const isInfo = tone === 'info';

  return (
    <View
      style={[
        styles.card,
        isInfo ? styles.infoCard : styles.defaultCard,
        isInfo ? null : cardShadow,
        style,
      ]}
    >
      <View style={styles.headingRow}>
        {isInfo && (
          <View style={styles.infoIcon}>
            <Ionicons name="information" size={13} color="#FFFFFF" />
          </View>
        )}
        <Text style={[styles.title, isInfo ? styles.infoTitle : styles.defaultTitle]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
  },
  defaultCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCard: {
    backgroundColor: '#EAF2FF',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  defaultTitle: {
    color: colors.text,
  },
  infoTitle: {
    color: colors.primary,
  },
});
