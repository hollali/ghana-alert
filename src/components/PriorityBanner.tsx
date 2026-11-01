import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/src/strings';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Priority } from '@/src/types';

const variants: Record<
  Priority,
  { background: string; text: string; border: string; label: string; icon: 'alert-circle' | 'alert' | 'information-circle' }
> = {
  high: {
    background: '#FDECEC',
    text: colors.danger,
    border: '#F6C6C8',
    label: strings.alertDetail.high,
    icon: 'alert-circle',
  },
  medium: {
    background: '#FFF4E5',
    text: '#9A3412',
    border: '#F8D9A8',
    label: strings.alertDetail.medium,
    icon: 'alert',
  },
  low: {
    background: '#EAF2FF',
    text: colors.info,
    border: '#C7DDFD',
    label: strings.alertDetail.low,
    icon: 'information-circle',
  },
};

export function PriorityBanner({ priority }: { priority: Priority }) {
  const variant = variants[priority] ?? variants.low;

  return (
    <View style={[styles.container, { backgroundColor: variant.background }]}>
      <View
        style={[styles.pill, { borderColor: variant.border }]}
        accessibilityLabel={variant.label}
      >
        <Ionicons name={variant.icon} size={14} color={variant.text} />
        <Text style={[styles.label, { color: variant.text }]}>{variant.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
});
