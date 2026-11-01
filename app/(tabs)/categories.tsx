import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryIcon } from '@/src/components/CategoryIcon';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { Screen } from '@/src/components/Screen';
import { CategoryListSkeleton } from '@/src/components/Skeleton';
import { useCategories } from '@/src/hooks/useCategories';
import { strings } from '@/src/strings';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';

export default function CategoriesScreen() {
  const { data, isLoading, error, refetch } = useCategories();

  return (
    <Screen edges={['top']} background={colors.background}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>{strings.categories.title}</Text>
      </View>

      {error ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading && data.length === 0 ? (
        <View style={styles.listWrap}>
          <CategoryListSkeleton count={7} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={[
            styles.list,
            data.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/category/${item.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}. ${item.description}`}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <CategoryIcon slug={item.slug} size={44} shape="square" solid />
              <View style={styles.texts}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray} />
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState icon="grid-outline" title={strings.categories.empty} />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  title: {
    height: 40,
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
    textAlignVertical: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  listWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 12,
  },
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  pressed: {
    opacity: 0.78,
  },
  texts: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
