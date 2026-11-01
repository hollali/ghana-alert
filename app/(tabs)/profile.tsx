import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MenuRow } from '@/src/components/MenuRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { strings } from '@/src/strings';
import { useAuthStore } from '@/src/store/authStore';
import { usePrefsStore } from '@/src/store/prefsStore';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';
import { initials } from '@/src/utils/greeting';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = usePrefsStore((state) => state.location);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <Screen edges={['top']} background={colors.background}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{strings.profile.title}</Text>
          <Pressable
            onPress={() => router.push('/settings/notifications')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={({ pressed }) => [styles.gear, pressed && styles.pressed]}
          >
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials(user.name)}</Text>
            )}
          </View>
          <View style={styles.userTexts}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          <MenuRow
            icon="person-outline"
            title={strings.profile.edit}
            subtitle={strings.profile.editTitle}
            onPress={() => router.push('/settings/profile')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="bookmark-outline"
            title={strings.profile.myAlerts}
            subtitle={strings.profile.myAlertsSubtitle}
            onPress={() => router.push('/saved')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="notifications-outline"
            title={strings.profile.notifications}
            subtitle={strings.profile.notificationsSubtitle}
            onPress={() => router.push('/settings/notifications')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="location-outline"
            title={strings.profile.location}
            subtitle={location}
            onPress={() => router.push('/settings/location')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="help-circle-outline"
            title={strings.profile.help}
            subtitle={strings.profile.helpSubtitle}
            onPress={() => router.push('/settings/help')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="information-circle-outline"
            title={strings.profile.about}
            subtitle={`${strings.profile.aboutSubtitle} ${version}`}
            onPress={() => router.push('/settings/about')}
          />
        </View>

        <PrimaryButton
          label={strings.profile.report}
          variant="secondary"
          onPress={() => router.push('/report')}
        />

        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={strings.profile.logout}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        >
          <Text style={styles.logoutText}>{strings.profile.logout}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
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
  gear: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  pressed: {
    opacity: 0.7,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCEBFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userTexts: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
  },
  userEmail: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  menuCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...cardShadow,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 56,
  },
  logout: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  logoutText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.danger,
  },
});
