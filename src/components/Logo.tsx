import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

interface LogoProps {
  size?: number;
  showRays?: boolean;
}

export function Logo({ size = 64, showRays = true }: LogoProps) {
  const rays = showRays && size >= 40;
  const shieldWidth = size * 0.29;
  const shieldHeight = size * 0.31;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {rays &&
        [-55, -30, 0, 30, 55].map((angle) => (
          <View
            key={angle}
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.rayLayer,
              { transform: [{ rotate: `${angle}deg` }] },
            ]}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: size / 2 - 1.25,
                width: 2.5,
                height: size * 0.1,
                borderRadius: 2,
                backgroundColor: colors.accent,
              }}
            />
          </View>
        ))}

      <MaterialCommunityIcons
        name="bell"
        size={size * 0.82}
        color={colors.accent}
        style={{ marginTop: size * 0.04 }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: size * 0.13,
          width: shieldWidth,
          height: shieldHeight,
          borderRadius: shieldWidth * 0.22,
          borderWidth: Math.max(1, size * 0.018),
          borderColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#CE1126' }} />
        <View style={[styles.stripe, { backgroundColor: '#FCD116' }]}>
          <MaterialCommunityIcons
            name="star"
            size={Math.max(5, size * 0.105)}
            color="#000000"
          />
        </View>
        <View style={{ flex: 1, backgroundColor: '#006B3F' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rayLayer: {
    alignItems: 'center',
  },
  stripe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
