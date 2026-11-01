import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { CategoryIcon } from '@/src/components/CategoryIcon';
import { Logo } from '@/src/components/Logo';
import { Screen } from '@/src/components/Screen';
import { SearchBar } from '@/src/components/SearchBar';
import { featuredAlert } from '@/src/data/alerts';
import { categories } from '@/src/data/categories';
import { strings } from '@/src/strings';
import { useAuthStore } from '@/src/store/authStore';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';
import type { CategorySlug } from '@/src/types';
import { firstName, greeting } from '@/src/utils/greeting';

const homeCategorySlugs: CategorySlug[] = [
  'product-safety',
  'food-health',
  'scams-fraud',
  'services',
  'travel-transport',
  'other',
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const user = useAuthStore((state) => state.user);
  const tileWidth = (width - 32 - 32) / 3;

  return (
    <Screen edges={['top']} background={colors.background}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Logo size={28} showRays={false} />
            <Text style={styles.brandText}>
              <Text style={styles.navy}>Ghana</Text>
              <Text style={styles.amber}>Alert</Text>
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/alerts')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="View alerts"
            style={styles.bellButton}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <View style={styles.badgeDot} />
          </Pressable>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.greetingName}>
            {firstName(user.name)} <Text style={styles.wave}>👋</Text>
          </Text>
          <Text style={styles.safeLine}>{strings.home.safe}</Text>
        </View>

        <SearchBar
          placeholder={strings.home.searchPlaceholder}
          onPress={() =>
            router.push({ pathname: '/alerts', params: { focus: String(Date.now()) } })
          }
          accessibilityLabel={strings.home.searchPlaceholder}
        />

        <Pressable
          onPress={() => router.push(`/alert/${featuredAlert.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`${strings.home.featured}. ${featuredAlert.title}. ${strings.home.viewDetails}`}
          style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
        >
          <View style={styles.bannerIcon}>
            <MaterialCommunityIcons name="bullhorn" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{strings.home.featured}</Text>
            <Text style={styles.bannerSummary} numberOfLines={2}>
              {featuredAlert.summary}
            </Text>
            <Text style={styles.bannerLink}>{strings.home.viewDetails} →</Text>
          </View>
        </Pressable>

        <View style={styles.grid}>
          {homeCategorySlugs.map((slug) => {
            const category = categories.find((item) => item.slug === slug);
            if (!category) return null;
            return (
              <Pressable
                key={slug}
                onPress={() => router.push(`/category/${slug}`)}
                accessibilityRole="button"
                accessibilityLabel={category.name}
                style={({ pressed }) => [
                  styles.tile,
                  { width: tileWidth },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.tileIcon}>
                  <CategoryIcon slug={slug} size={56} />
                </View>
                <Text style={styles.tileLabel} numberOfLines={2}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  navy: {
    color: colors.primary,
  },
  amber: {
    color: colors.accent,
  },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  greetingBlock: {
    gap: 2,
    marginTop: -4,
  },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  greetingName: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  wave: {
    fontSize: 22,
  },
  safeLine: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  banner: {
    minHeight: 120,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    ...cardShadow,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    gap: 3,
  },
  bannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  bannerSummary: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  bannerLink: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 2,
  },
  tile: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  tileIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    minHeight: 32,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: colors.text,
  },
  pressed: {
    opacity: 0.82,
  },
});
