import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AlertListItem } from '@/src/components/AlertListItem';
import { AppHeader } from '@/src/components/AppHeader';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { Screen } from '@/src/components/Screen';
import { AlertListSkeleton } from '@/src/components/Skeleton';
import { categories } from '@/src/data/categories';
import { useAlerts } from '@/src/hooks/useAlerts';
import { strings } from '@/src/strings';
import { colors, fonts } from '@/src/theme/tokens';
import type { CategorySlug } from '@/src/types';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, isLoading, error, refetch } = useAlerts();

  const category = categories.find((item) => item.slug === slug);

  const filtered = useMemo(
    () =>
      data
        .filter((alert) => alert.category === (slug as CategorySlug))
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        ),
    [data, slug],
  );

  return (
    <Screen edges={['top']} background={colors.background}>
      <StatusBar style="dark" />
      <AppHeader
        title={category?.name ?? strings.categories.title}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/categories');
        }}
      />

      {!!category && <Text style={styles.description}>{category.description}</Text>}

      {error ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading && data.length === 0 ? (
        <View style={styles.skeletonWrap}>
          <AlertListSkeleton count={4} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertListItem
              alert={item}
              onPress={() => router.push(`/alert/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            styles.list,
            filtered.length === 0 && styles.listEmpty,
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
          ListEmptyComponent={
            <EmptyState
              icon="file-tray-outline"
              title={strings.categories.empty}
              message={strings.alerts.emptyBody}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 8,
  },
  skeletonWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
});
