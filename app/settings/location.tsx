import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { Snackbar } from '@/src/components/Snackbar';
import { regions } from '@/src/data/user';
import { strings } from '@/src/strings';
import { usePrefsStore } from '@/src/store/prefsStore';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';

export default function LocationScreen() {
  const location = usePrefsStore((state) => state.location);
  const setLocation = usePrefsStore((state) => state.setLocation);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const applyCurrentLocation = async () => {
    setError(null);
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError(strings.location.permissionDenied);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      let label = '';
      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        label = [place?.city, place?.region, place?.country]
          .filter(Boolean)
          .join(', ');
      } catch {
        label = '';
      }
      setLocation(
        label ||
          `Current location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
      );
      setSnack(strings.location.saved);
    } catch {
      setError(strings.location.unavailable);
    } finally {
      setLocating(false);
    }
  };

  const chooseRegion = (region: string) => {
    setLocation(region);
    setSnack(strings.location.saved);
  };

  return (
    <Screen edges={['top', 'bottom']} background={colors.background}>
      <StatusBar style="dark" />
      <AppHeader
        title={strings.location.title}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/profile');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{strings.location.subtitle}</Text>

        <View style={styles.currentCard}>
          <View style={styles.pin}>
            <Ionicons name="location" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.currentTexts}>
            <Text style={styles.currentLabel}>{strings.location.currentSetting}</Text>
            <Text style={styles.currentValue}>{location}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => void applyCurrentLocation()}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel={`${strings.location.current}. ${strings.location.currentSubtitle}`}
          style={({ pressed }) => [styles.card, styles.currentRow, pressed && styles.pressed]}
        >
          <View style={styles.rowIcon}>
            {locating ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons name="navigate-outline" size={20} color={colors.primary} />
            )}
          </View>
          <View style={styles.currentTexts}>
            <Text style={styles.rowTitle}>{strings.location.current}</Text>
            <Text style={styles.rowSubtitle}>{strings.location.currentSubtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.gray} />
        </Pressable>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.sectionLabel}>{strings.location.regions}</Text>

        <View style={styles.card}>
          {regions.map((region, index) => {
            const selected = region === location;
            return (
              <View key={region}>
                {index > 0 && <View style={styles.divider} />}
                <Pressable
                  onPress={() => chooseRegion(region)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={region}
                  style={({ pressed }) => [styles.regionRow, pressed && styles.pressed]}
                >
                  <Text
                    style={[styles.regionLabel, selected && styles.regionSelected]}
                  >
                    {region}
                  </Text>
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Snackbar
        visible={!!snack}
        message={snack ?? ''}
        onDismiss={() => setSnack(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
    gap: 12,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    ...cardShadow,
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTexts: {
    flex: 1,
    gap: 2,
  },
  currentLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  currentValue: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...cardShadow,
  },
  currentRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  rowSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.danger,
  },
  sectionLabel: {
    marginTop: 8,
    marginLeft: 2,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
  regionRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  regionLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  regionSelected: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  pressed: {
    opacity: 0.75,
  },
});
