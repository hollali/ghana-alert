import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState, type ComponentRef } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertListItem } from '@/src/components/AlertListItem';
import { Chip } from '@/src/components/Chip';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { Screen } from '@/src/components/Screen';
import { SearchBar } from '@/src/components/SearchBar';
import { AlertListSkeleton } from '@/src/components/Skeleton';
import { categories, categoryNames } from '@/src/data/categories';
import { useAlerts } from '@/src/hooks/useAlerts';
import { strings } from '@/src/strings';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { CategorySlug } from '@/src/types';

type SortKey = 'latest' | 'viewed' | 'priority';

const PAGE_SIZE = 6;

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'latest', label: strings.alerts.latest },
  { key: 'viewed', label: strings.alerts.mostViewed },
  { key: 'priority', label: strings.alerts.highPriority },
];

export default function AlertsScreen() {
  const params = useLocalSearchParams<{ q?: string; focus?: string }>();
  const insets = useSafeAreaInsets();
  const searchRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { data, isLoading, error, refetch } = useAlerts();

  const [query, setQuery] = useState(params.q ?? '');
  const [sort, setSort] = useState<SortKey>('latest');
  const [categoryFilter, setCategoryFilter] = useState<CategorySlug | 'all'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const focusToken = params.focus ?? params.q ?? null;
  const shouldFocus = !!focusToken;
  const handledToken = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!focusToken || handledToken.current === focusToken) return;
      handledToken.current = focusToken;
      const timer = setTimeout(() => searchRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }, [focusToken]),
  );

  const filtered = useMemo(() => {
    let list = [...data];
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter((alert) =>
        [alert.title, alert.summary, alert.body, categoryNames[alert.category]]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((alert) => alert.category === categoryFilter);
    }

    if (sort === 'viewed') {
      list.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    } else if (sort === 'priority') {
      list = list.filter((alert) => alert.priority === 'high');
      list.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    }

    return list;
  }, [data, query, sort, categoryFilter]);

  const activeCategory =
    categoryFilter === 'all'
      ? null
      : categories.find((category) => category.slug === categoryFilter);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const changeSearch = (text: string) => {
    setQuery(text);
    setPage(1);
  };

  const changeSort = (key: SortKey) => {
    setSort(key);
    setPage(1);
  };

  const changeCategory = (value: CategorySlug | 'all') => {
    setCategoryFilter(value);
    setPage(1);
  };

  return (
    <Screen edges={['top']} background={colors.background}>
      <StatusBar style="dark" />

      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{strings.alerts.title}</Text>
          <Pressable
            onPress={() => setFilterOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Filter alerts"
            style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
          >
            <Ionicons name="options-outline" size={24} color={colors.text} />
            {categoryFilter !== 'all' && <View style={styles.filterDot} />}
          </Pressable>
        </View>

        <SearchBar
          ref={searchRef}
          value={query}
          onChangeText={changeSearch}
          placeholder={strings.home.searchPlaceholder}
          autoFocus={shouldFocus}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {sortOptions.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={sort === option.key}
              onPress={() => changeSort(option.key)}
            />
          ))}
        </ScrollView>

        {activeCategory && (
          <Pressable
            onPress={() => changeCategory('all')}
            style={styles.activeFilter}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${activeCategory.name} filter`}
          >
            <Text style={styles.activeFilterText}>{activeCategory.name}</Text>
            <Ionicons name="close" size={14} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {error ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading && data.length === 0 ? (
        <View style={styles.skeletonWrap}>
          <AlertListSkeleton count={6} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertListItem
              alert={item}
              onPress={() => router.push(`/alert/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={() => {
            if (hasMore) setPage((current) => current + 1);
          }}
          onEndReachedThreshold={0.5}
          contentContainerStyle={[
            styles.list,
            visible.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                setPage(1);
                void refetch();
              }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={strings.alerts.empty}
              message={strings.alerts.emptyBody}
            />
          }
        />
      )}

      <Modal
        visible={filterOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFilterOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setFilterOpen(false)}
            accessibilityLabel="Close filter"
          />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{strings.alerts.filterTitle}</Text>
              <Pressable
                onPress={() => setFilterOpen(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={strings.common.close}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <FilterRow
                label={strings.alerts.allCategories}
                selected={categoryFilter === 'all'}
                onPress={() => {
                  changeCategory('all');
                  setFilterOpen(false);
                }}
              />
              {categories.map((category) => (
                <FilterRow
                  key={category.slug}
                  label={category.name}
                  selected={categoryFilter === category.slug}
                  onPress={() => {
                    changeCategory(category.slug);
                    setFilterOpen(false);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function FilterRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.filterRow, pressed && styles.pressed]}
    >
      <Text style={[styles.filterRowLabel, selected && styles.filterRowLabelSelected]}>
        {label}
      </Text>
      {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 12,
  },
  titleRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  filterDot: {
    position: 'absolute',
    top: 11,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  chips: {
    gap: 8,
    paddingRight: 16,
  },
  activeFilter: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: '#EAF2FF',
  },
  activeFilterText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.primary,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
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
    paddingTop: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.text,
  },
  filterRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  filterRowLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  filterRowLabelSelected: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
});
