import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/src/components/AppHeader';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { InfoCard } from '@/src/components/InfoCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PriorityBanner } from '@/src/components/PriorityBanner';
import { Screen } from '@/src/components/Screen';
import { Skeleton } from '@/src/components/Skeleton';
import { Snackbar } from '@/src/components/Snackbar';
import { categoryNames, categoryStyles } from '@/src/data/categories';
import { useAlert } from '@/src/hooks/useAlerts';
import { strings } from '@/src/strings';
import { useSavedStore } from '@/src/store/savedStore';
import { colors, fonts, radius } from '@/src/theme/tokens';
import { timeAgo } from '@/src/utils/timeAgo';

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: alert, isLoading, error, refetch } = useAlert(id);

  const entries = useSavedStore((state) => state.entries);
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const setStatus = useSavedStore((state) => state.setStatus);

  const [snack, setSnack] = useState<string | null>(null);

  const entry = entries.find((item) => item.id === id);
  const isBookmarked = !!entry;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/alerts');
    }
  };

  const handleShare = async () => {
    if (!alert) return;
    try {
      await Share.share({
        title: alert.title,
        message: `${alert.title}\n\nghanaalert://alert/${alert.id}`,
        url: `ghanaalert://alert/${alert.id}`,
      });
    } catch {
      RNAlert.alert(strings.alertDetail.saveError);
    }
  };

  const handleBookmark = () => {
    if (!alert) return;
    const added = toggleSaved(alert.id);
    setSnack(added ? strings.alertDetail.savedToast : strings.alertDetail.removedToast);
  };

  const openMenu = () => {
    if (!alert) return;
    RNAlert.alert(strings.alertDetail.menu, undefined, [
      {
        text: isBookmarked ? strings.alertDetail.unsave : strings.alertDetail.save,
        onPress: handleBookmark,
      },
      {
        text: strings.alertDetail.readLater,
        onPress: () => {
          setStatus(alert.id, 'read_later');
          setSnack(strings.alertDetail.readLaterToast);
        },
      },
      { text: strings.common.cancel, style: 'cancel' },
    ]);
  };

  const header = (
    <AppHeader
      showBack
      onBack={goBack}
      right={
        <>
          <Pressable
            onPress={handleShare}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={strings.common.share}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={handleBookmark}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? strings.alertDetail.unsave : strings.alertDetail.save}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isBookmarked ? colors.primary : colors.text}
            />
          </Pressable>
          <Pressable
            onPress={openMenu}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={strings.alertDetail.menu}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
          </Pressable>
        </>
      }
    />
  );

  if (error) {
    return (
      <Screen edges={['top']} background={colors.surface}>
        <StatusBar style="dark" />
        {header}
        <ErrorState onRetry={refetch} />
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen edges={['top']} background={colors.surface}>
        <StatusBar style="dark" />
        {header}
        <View style={styles.skeleton}>
          <Skeleton height={48} borderRadius={radius.md} />
          <Skeleton width="88%" height={26} />
          <Skeleton width="60%" height={26} />
          <Skeleton width="45%" height={16} />
          <View style={styles.skeletonBody}>
            <Skeleton height={14} />
            <Skeleton height={14} />
            <Skeleton height={14} />
            <Skeleton width="70%" height={14} />
          </View>
          <Skeleton height={120} borderRadius={radius.lg} />
        </View>
      </Screen>
    );
  }

  if (!alert) {
    return (
      <Screen edges={['top']} background={colors.surface}>
        <StatusBar style="dark" />
        {header}
        <EmptyState
          icon="alert-circle-outline"
          title={strings.alertDetail.notFound}
          message={strings.alertDetail.notFoundBody}
          actionLabel={strings.alertDetail.backToAlerts}
          onAction={() => router.replace('/(tabs)/alerts')}
        />
      </Screen>
    );
  }

  const categoryColor = categoryStyles[alert.category]?.color ?? colors.gray;

  return (
    <Screen edges={['top']} background={colors.surface}>
      <StatusBar style="dark" />
      {header}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <PriorityBanner priority={alert.priority} />

        <Text style={styles.title} numberOfLines={2}>
          {alert.title}
        </Text>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.categoryChip,
              { backgroundColor: `${categoryColor}1F`, borderColor: `${categoryColor}33` },
            ]}
          >
            <Text style={[styles.categoryChipText, { color: categoryColor }]}>
              {categoryNames[alert.category]}
            </Text>
          </View>
          <Text style={styles.time}>{timeAgo(alert.publishedAt)}</Text>
        </View>

        <Text style={styles.body}>{alert.body}</Text>

        {alert.affectedProducts && (
          <InfoCard title={strings.alertDetail.affectedProducts}>
            {alert.affectedProducts.brand && (
              <DetailRow
                label={strings.alertDetail.brand}
                value={alert.affectedProducts.brand}
              />
            )}
            {!!alert.affectedProducts.batchNumbers?.length && (
              <DetailRow
                label={strings.alertDetail.batchNumbers}
                value={alert.affectedProducts.batchNumbers.join(', ')}
              />
            )}
            {alert.affectedProducts.bestBefore && (
              <DetailRow
                label={strings.alertDetail.bestBefore}
                value={alert.affectedProducts.bestBefore}
              />
            )}
          </InfoCard>
        )}

        {!!alert.recommendedActions?.length && (
          <InfoCard title={strings.alertDetail.actions} tone="info">
            <View style={styles.bullets}>
              {alert.recommendedActions.map((action) => (
                <View key={action} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{action}</Text>
                </View>
              ))}
            </View>
          </InfoCard>
        )}

        <Text style={styles.source}>
          {strings.alertDetail.source}: {alert.source}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton label={strings.alertDetail.share} onPress={handleShare} />
      </View>

      <Snackbar
        visible={!!snack}
        message={snack ?? ''}
        onDismiss={() => setSnack(null)}
        duration={2500}
        bottomOffset={72 + insets.bottom}
      />
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 30,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -4,
  },
  categoryChip: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
  detailValue: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  bullets: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.info,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  source: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconButton: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  skeleton: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  skeletonBody: {
    gap: 8,
    marginTop: 6,
  },
});
