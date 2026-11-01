import { useEffect, useMemo } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius } from '@/src/theme/tokens';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 14, borderRadius = 6, style }: SkeletonProps) {
  const opacity = useMemo(() => new Animated.Value(0.45), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E8ECF3',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function AlertListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View
      style={styles.list}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading alerts"
      accessibilityLiveRegion="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={styles.lines}>
            <Skeleton width="78%" height={14} />
            <Skeleton width="92%" height={12} />
            <Skeleton width="42%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function CategoryListSkeleton({ count = 7 }: { count?: number }) {
  return (
    <View
      style={styles.list}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading categories"
      accessibilityLiveRegion="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.categoryCard}>
          <Skeleton width={44} height={44} borderRadius={12} />
          <View style={styles.lines}>
            <Skeleton width="45%" height={14} />
            <Skeleton width="75%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  card: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  lines: {
    flex: 1,
    gap: 8,
  },
});
