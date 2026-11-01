import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/src/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface MenuRowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

export function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  destructive = false,
}: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={22}
          color={destructive ? colors.danger : colors.primary}
        />
      </View>

      <View style={styles.texts}>
        <Text style={[styles.title, destructive && styles.destructive]}>{title}</Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {showChevron && (
        <Ionicons name="chevron-forward" size={18} color={colors.gray} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pressed: {
    backgroundColor: '#F9FAFB',
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  destructive: {
    color: colors.danger,
  },
});
