import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/src/components/CategoryIcon';
import { categoryNames } from '@/src/data/categories';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';
import type { Alert } from '@/src/types';
import { timeAgo } from '@/src/utils/timeAgo';

interface AlertListItemProps {
  alert: Alert;
  onPress: () => void;
  right?: 'chevron' | 'bookmark' | 'none';
  bookmarked?: boolean;
  onRightPress?: () => void;
}

export function AlertListItem({
  alert,
  onPress,
  right = 'chevron',
  bookmarked = false,
  onRightPress,
}: AlertListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${alert.title}. ${categoryNames[alert.category]}, ${timeAgo(alert.publishedAt)}.`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <CategoryIcon slug={alert.category} size={40} />

      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {alert.title}
        </Text>
        <Text style={styles.summary} numberOfLines={1}>
          {alert.summary}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {categoryNames[alert.category]} · {timeAgo(alert.publishedAt)}
        </Text>
      </View>

      {right === 'chevron' && (
        <Ionicons name="chevron-forward" size={18} color={colors.gray} />
      )}

      {right === 'bookmark' && (
        <Pressable
          onPress={onRightPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark alert'}
          style={styles.bookmark}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={21}
            color={colors.primary}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  pressed: {
    opacity: 0.75,
  },
  middle: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  summary: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  bookmark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
});
