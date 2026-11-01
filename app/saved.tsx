import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AlertListItem } from '@/src/components/AlertListItem';
import { AppHeader } from '@/src/components/AppHeader';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { Screen } from '@/src/components/Screen';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { AlertListSkeleton } from '@/src/components/Skeleton';
import { Snackbar } from '@/src/components/Snackbar';
import { useAlerts } from '@/src/hooks/useAlerts';
import { strings } from '@/src/strings';
import { useSavedStore } from '@/src/store/savedStore';
import { colors } from '@/src/theme/tokens';
import type { SavedEntry } from '@/src/types';

const segments = [strings.saved.saved, strings.saved.readLater];

export default function SavedScreen() {
  const { data, isLoading, error, refetch } = useAlerts();
  const entries = useSavedStore((state) => state.entries);
  const remove = useSavedStore((state) => state.remove);
  const restore = useSavedStore((state) => state.restore);

  const [segment, setSegment] = useState(0);
  const [removed, setRemoved] = useState<SavedEntry | null>(null);

  const status = segment === 0 ? 'saved' : 'read_later';

  const list = useMemo(() => {
    const byId = new Map(data.map((alert) => [alert.id, alert]));
    return entries
      .filter((entry) => entry.status === status)
      .flatMap((entry) => {
        const alert = byId.get(entry.id);
        return alert ? [{ entry, alert }] : [];
      });
  }, [data, entries, status]);

  const handleRemove = (entry: SavedEntry) => {
    remove(entry.id);
    setRemoved(entry);
  };

  const handleUndo = () => {
    if (removed) {
      restore(removed);
      setRemoved(null);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} background={colors.surface}>
      <StatusBar style="dark" />
      <AppHeader
        title={strings.saved.title}
        centered
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/profile');
        }}
      />

      <View style={styles.segments}>
        <SegmentedControl
          segments={segments}
          value={segment}
          onChange={setSegment}
          accessibilityLabel={strings.saved.title}
        />
      </View>

      {error ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading && data.length === 0 ? (
        <View style={styles.skeletonWrap}>
          <AlertListSkeleton count={4} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.entry.id}
          renderItem={({ item }) => (
            <AlertListItem
              alert={item.alert}
              onPress={() => router.push(`/alert/${item.alert.id}`)}
              right="bookmark"
              bookmarked
              onRightPress={() => handleRemove(item.entry)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[styles.list, list.length === 0 && styles.listEmpty]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={segment === 0 ? 'bookmark-outline' : 'time-outline'}
              title={
                segment === 0 ? strings.saved.emptySaved : strings.saved.emptyReadLater
              }
              message={strings.saved.emptyBody}
            />
          }
        />
      )}

      <Snackbar
        visible={!!removed}
        message={
          segment === 0 ? strings.saved.removed : strings.saved.readLaterRemoved
        }
        actionLabel={strings.saved.undo}
        onAction={handleUndo}
        onDismiss={() => setRemoved(null)}
        duration={4000}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  segments: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
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
