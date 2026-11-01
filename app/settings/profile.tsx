import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { Snackbar } from '@/src/components/Snackbar';
import { strings } from '@/src/strings';
import { useAuthStore } from '@/src/store/authStore';
import { initials } from '@/src/utils/greeting';
import { cardShadow, colors, fonts, radius } from '@/src/theme/tokens';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);

  const [name, setName] = useState(user.name);
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatarUrl ?? null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    photo?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const pickPhoto = async () => {
    setErrors((prev) => ({ ...prev, photo: undefined }));
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
        setErrors((prev) => ({ ...prev, photo: strings.report.photoTooLarge }));
        return;
      }
      setAvatarUri(asset.uri);
    } catch {
      setErrors((prev) => ({ ...prev, photo: strings.report.photoFailed }));
    }
  };

  const removePhoto = () => setAvatarUri(null);

  const save = () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = strings.auth.nameRequired;

    const wantsPasswordChange =
      currentPassword.trim() !== '' ||
      newPassword.trim() !== '' ||
      confirmPassword.trim() !== '';

    if (wantsPasswordChange) {
      if (!currentPassword.trim()) {
        nextErrors.currentPassword = strings.auth.passwordRequired;
      }
      if (!newPassword.trim()) {
        nextErrors.newPassword = strings.auth.passwordRequired;
      }
      if (newPassword !== confirmPassword) {
        nextErrors.confirmPassword = strings.profile.passwordMismatch;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      updateProfile({ name, avatarUrl: avatarUri });

      if (wantsPasswordChange) {
        const ok = changePassword(currentPassword, newPassword);
        if (!ok) {
          setErrors({ currentPassword: strings.profile.passwordWrong });
          return;
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSnack(strings.profile.passwordChanged);
      } else {
        setSnack(strings.profile.saved);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} background={colors.background}>
      <StatusBar style="dark" />
      <AppHeader
        title={strings.profile.editTitle}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/profile');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials(name || user.name)}</Text>
            )}
          </View>
          <View style={styles.avatarActions}>
            <Pressable
              onPress={() => void pickPhoto()}
              accessibilityRole="button"
              accessibilityLabel={strings.profile.changePhoto}
              style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}
            >
              <Ionicons name="image-outline" size={18} color={colors.primary} />
              <Text style={styles.photoButtonText}>{strings.profile.changePhoto}</Text>
            </Pressable>
            {avatarUri ? (
              <Pressable
                onPress={removePhoto}
                accessibilityRole="button"
                accessibilityLabel={strings.profile.removePhoto}
                style={({ pressed }) => [styles.photoButton, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={[styles.photoButtonText, { color: colors.danger }]}>
                  {strings.profile.removePhoto}
                </Text>
              </Pressable>
            ) : null}
          </View>
          {!!errors.photo && <Text style={styles.error}>{errors.photo}</Text>}
        </View>

        <View style={styles.card}>
          <FormField
            label={strings.profile.nameLabel}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />
          <FormField
            label={strings.profile.emailLabel}
            value={user.email}
            editable={false}
            style={styles.readOnly}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{strings.profile.passwordSection}</Text>
          <FormField
            label={strings.profile.currentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.currentPassword}
          />
          <FormField
            label={strings.profile.newPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.newPassword}
          />
          <FormField
            label={strings.profile.confirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
          />
        </View>

        <PrimaryButton
          label={strings.profile.save}
          onPress={save}
          loading={saving}
          disabled={saving}
        />
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
    gap: 16,
  },
  avatarCard: {
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DCEBFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.primary,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  photoButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  card: {
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  readOnly: {
    color: colors.textMuted,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.danger,
  },
});
