import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { Screen } from '@/src/components/Screen';
import { Snackbar } from '@/src/components/Snackbar';
import { categories } from '@/src/data/categories';
import { useAlerts } from '@/src/hooks/useAlerts';
import { strings } from '@/src/strings';
import { usePrefsStore } from '@/src/store/prefsStore';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';
import { scheduleTestAlert, requestNotificationPermission } from '@/src/utils/notifications';

export default function NotificationsScreen() {
  const notificationsEnabled = usePrefsStore((state) => state.notificationsEnabled);
  const categoryPrefs = usePrefsStore((state) => state.categories);
  const setNotificationsEnabled = usePrefsStore(
    (state) => state.setNotificationsEnabled,
  );
  const toggleCategory = usePrefsStore((state) => state.toggleCategory);
  const { data } = useAlerts();
  const [snack, setSnack] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleMaster = async (value: boolean) => {
    if (!value) {
      setNotificationsEnabled(false);
      return;
    }
    setBusy(true);
    const granted = await requestNotificationPermission();
    setBusy(false);
    if (!granted) {
      Alert.alert(
        strings.notifications.permissionTitle,
        strings.notifications.permissionBody,
        [
          { text: strings.common.cancel, style: 'cancel' },
          {
            text: strings.common.openSettings,
            onPress: () => void Linking.openSettings(),
          },
        ],
      );
      return;
    }
    setNotificationsEnabled(true);
  };

  const sendTest = async () => {
    if (!notificationsEnabled) {
      Alert.alert(strings.notifications.title, strings.notifications.enableFirst);
      return;
    }
    if (Platform.OS === 'web') {
      Alert.alert(strings.notifications.title, strings.notifications.webUnsupported);
      return;
    }
    const alert = data.find((item) => item.id === '2') ?? data[0];
    const body = alert ? `${alert.title}. ${alert.summary}` : strings.notifications.testBody;
    const scheduled = await scheduleTestAlert(
      alert?.id ?? '2',
      strings.notifications.testTitle,
      body,
    );
    if (!scheduled) {
      Alert.alert(
        strings.notifications.permissionTitle,
        strings.notifications.permissionBody,
        [
          { text: strings.common.cancel, style: 'cancel' },
          {
            text: strings.common.openSettings,
            onPress: () => void Linking.openSettings(),
          },
        ],
      );
      return;
    }
    setSnack(strings.notifications.scheduled);
  };

  return (
    <Screen edges={['top', 'bottom']} background={colors.background}>
      <StatusBar style="dark" />
      <AppHeader
        title={strings.notifications.title}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/profile');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowTexts}>
              <Text style={styles.rowTitle}>{strings.notifications.master}</Text>
              <Text style={styles.rowSubtitle}>
                {strings.notifications.masterSubtitle}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => void toggleMaster(value)}
              disabled={busy}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              accessibilityLabel={strings.notifications.master}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{strings.notifications.categories}</Text>

        <View style={styles.card}>
          {categories.map((category, index) => (
            <View key={category.slug}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <CategoryIcon slug={category.slug} size={32} />
                <View style={styles.rowTexts}>
                  <Text style={styles.rowTitle}>{category.name}</Text>
                </View>
                <Switch
                  value={!!categoryPrefs[category.slug]}
                  onValueChange={() => toggleCategory(category.slug)}
                  disabled={!notificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel={`${category.name} notifications`}
                />
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => void sendTest()}
          disabled={!notificationsEnabled}
          accessibilityRole="button"
          accessibilityLabel={`${strings.notifications.test}. ${strings.notifications.testSubtitle}`}
          style={({ pressed }) => [
            styles.card,
            styles.testRow,
            !notificationsEnabled && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.rowIcon}>
            <Ionicons name="paper-plane-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.rowTexts}>
            <Text style={styles.rowTitle}>{strings.notifications.test}</Text>
            <Text style={styles.rowSubtitle}>{strings.notifications.testSubtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.gray} />
        </Pressable>

        <Text style={styles.note}>{strings.notifications.demoNote}</Text>
      </ScrollView>

      <Snackbar
        visible={!!snack}
        message={snack ? `${snack}. ${strings.notifications.scheduledBody}` : ''}
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
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...cardShadow,
  },
  row: {
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
  rowTexts: {
    flex: 1,
    gap: 2,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 60,
  },
  sectionLabel: {
    marginTop: 8,
    marginLeft: 2,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
  testRow: {
    marginTop: 4,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
  note: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
