import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { categoryStyles } from '@/src/data/categories';
import { radius, tint } from '@/src/theme/tokens';
import type { CategorySlug } from '@/src/types';

interface CategoryIconProps {
  slug: CategorySlug;
  size?: number;
  shape?: 'circle' | 'square';
  solid?: boolean;
  iconSize?: number;
}

export function CategoryIcon({
  slug,
  size = 40,
  shape = 'circle',
  solid = false,
  iconSize,
}: CategoryIconProps) {
  const meta = categoryStyles[slug] ?? categoryStyles.other;
  const resolvedIconSize = iconSize ?? Math.round(size * 0.55);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: shape === 'circle' ? size / 2 : radius.md,
        backgroundColor: solid ? meta.color : tint(meta.color, 0.12),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons
        accessible={false}
        importantForAccessibility="no"
        name={meta.icon}
        size={resolvedIconSize}
        color={solid ? '#FFFFFF' : meta.color}
      />
    </View>
  );
}
