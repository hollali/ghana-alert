import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, radius } from '@/src/theme/tokens';

interface SnackbarProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
  bottomOffset?: number;
}

export function Snackbar({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
  bottomOffset = 0,
}: SnackbarProps) {
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(onDismiss, duration);
    return () => clearTimeout(timeout);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <View style={[styles.wrapper, { bottom: 16 + bottomOffset }]} pointerEvents="box-none">
      <View style={styles.container} accessibilityLiveRegion="polite">
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {!!actionLabel && onAction && (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={8}
          >
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: '#1F2937',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  message: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#FFFFFF',
  },
  action: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#F5A623',
  },
});
