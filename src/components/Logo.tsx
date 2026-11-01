import { Image, View } from 'react-native';

interface LogoProps {
  size?: number;
  showRays?: boolean;
}

export function Logo({ size = 64 }: LogoProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityLabel="GhanaAlert"
      />
    </View>
  );
}
