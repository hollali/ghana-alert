import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/src/theme/tokens';

interface SegmentedControlProps {
  segments: string[];
  value: number;
  onChange: (index: number) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl({
  segments,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps) {
  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      {segments.map((segment, index) => {
        const selected = index === value;
        return (
          <Pressable
            key={segment}
            onPress={() => onChange(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={segment}
            style={[styles.segment, selected && styles.selectedSegment]}
          >
            <Text style={[styles.label, selected ? styles.selectedLabel : styles.labelDefault]}>
              {segment}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 3,
  },
  segment: {
    flex: 1,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSegment: {
    backgroundColor: colors.primary,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  labelDefault: {
    color: colors.textMuted,
  },
  selectedLabel: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
});
