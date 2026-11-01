import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/src/theme/tokens';

interface AppHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: ReactNode;
  left?: ReactNode;
  centered?: boolean;
}

export function AppHeader({
  title,
  onBack,
  showBack = true,
  right,
  left,
  centered = false,
}: AppHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {left ??
          (showBack ? (
            <Pressable
              onPress={handleBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ) : null)}
      </View>

      {title ? (
        <Text style={[styles.title, centered && styles.centeredTitle]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.titleSpacer} />
      )}

      <View style={[styles.side, styles.rightSide]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  side: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rightSide: {
    justifyContent: 'flex-end',
    gap: 6,
  },
  title: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
    marginLeft: 4,
  },
  centeredTitle: {
    textAlign: 'center',
    marginLeft: 0,
  },
  titleSpacer: {
    flex: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  pressed: {
    opacity: 0.6,
  },
});
