import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { AppHeader } from '@/src/components/AppHeader';
import { FormField } from '@/src/components/FormField';
import { OptionSheet } from '@/src/components/OptionSheet';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { categories } from '@/src/data/categories';
import { regions } from '@/src/data/user';
import { strings } from '@/src/strings';
import { useReportsStore } from '@/src/store/reportsStore';
import { colors, fonts, radius } from '@/src/theme/tokens';

const schema = z.object({
  issueType: z.enum([
    'product-safety',
    'food-health',
    'scams-fraud',
    'services',
    'travel-transport',
    'consumer-rights',
    'other',
  ]),
  title: z
    .string()
    .trim()
    .min(5, strings.report.titleError)
    .max(100, strings.report.titleError),
  description: z.string().trim().min(20, strings.report.descriptionError),
  location: z.string().optional(),
});

type ReportForm = z.infer<typeof schema>;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const issueOptions = categories.map((category) => ({
  value: category.slug,
  label: category.name,
  subtitle: category.description,
}));

const locationOptions = [
  {
    value: '__current',
    label: strings.report.useCurrent,
    subtitle: strings.location.currentSubtitle,
  },
  ...regions.map((region) => ({ value: region, label: region })),
];

export default function ReportScreen() {
  const addReport = useReportsStore((state) => state.addReport);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      issueType: 'product-safety',
      title: '',
      description: '',
      location: '',
    },
  });

  const issueType = watch('issueType');
  const location = watch('location');

  const [issueOpen, setIssueOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedIssue =
    categories.find((category) => category.slug === issueType)?.name ??
    categories[0].name;

  const pickPhoto = async () => {
    setPhotoError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPhotoError(strings.report.photoFailed);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
        setPhotoError(strings.report.photoTooLarge);
        return;
      }
      setPhotoUri(asset.uri);
    } catch {
      setPhotoError(strings.report.photoFailed);
    }
  };

  const applyCurrentLocation = async () => {
    setLocationError(null);
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationError(strings.location.permissionDenied);
        setLocationOpen(false);
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
      setValue(
        'location',
        label ||
          `Current location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
      );
      setLocationOpen(false);
    } catch {
      setLocationError(strings.location.unavailable);
      setLocationOpen(false);
    } finally {
      setLocating(false);
    }
  };

  const onValid = async (values: ReportForm) => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    addReport({
      issueType: values.issueType,
      title: values.title,
      description: values.description,
      location: values.location || undefined,
      photoUri: photoUri ?? undefined,
    });
    setSubmitting(false);
    setSuccess(true);
  };

  const closeSuccess = () => {
    setSuccess(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <Screen edges={['top', 'bottom']} background={colors.surface}>
      <StatusBar style="dark" />
      <AppHeader
        title={strings.report.title}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>{strings.report.intro}</Text>

          <Controller
            control={control}
            name="issueType"
            render={() => (
              <View style={styles.field}>
                <Text style={styles.label}>{strings.report.issueType}</Text>
                <Pressable
                  onPress={() => setIssueOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`${strings.report.issueType}: ${selectedIssue}`}
                  style={({ pressed }) => [styles.select, pressed && styles.pressed]}
                >
                  <Text style={styles.selectValue}>{selectedIssue}</Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            )}
          />

          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormField
                label={strings.report.titleLabel}
                placeholder={strings.report.titlePlaceholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={100}
                error={errors.title?.message}
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormField
                label={strings.report.description}
                placeholder={strings.report.descriptionPlaceholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                maxLength={2000}
                error={errors.description?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>{strings.report.location}</Text>
                <Pressable
                  onPress={() => setLocationOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`${strings.report.location}: ${
                    value || strings.report.locationPlaceholder
                  }`}
                  style={({ pressed }) => [styles.select, pressed && styles.pressed]}
                >
                  <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                  <Text
                    style={[
                      styles.selectValue,
                      styles.locationValue,
                      !value && styles.placeholder,
                    ]}
                    numberOfLines={1}
                  >
                    {value || strings.report.locationPlaceholder}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </Pressable>
                {!!locationError && <Text style={styles.error}>{locationError}</Text>}
              </View>
            )}
          />

          <View style={styles.field}>
            <Text style={styles.label}>{strings.report.photo}</Text>
            <Pressable
              onPress={pickPhoto}
              accessibilityRole="button"
              accessibilityLabel={photoUri ? strings.report.changeImage : strings.report.chooseImage}
              style={({ pressed }) => [
                styles.photoBox,
                photoUri ? styles.photoBoxFilled : styles.photoBoxDashed,
                pressed && styles.pressed,
              ]}
            >
              {photoUri ? (
                <View style={styles.photoRow}>
                  <Image source={{ uri: photoUri }} style={styles.thumbnail} />
                  <Text style={styles.photoText}>{strings.report.changeImage}</Text>
                  <Pressable
                    onPress={() => setPhotoUri(null)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={strings.report.removePhoto}
                    style={styles.removePhoto}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              ) : (
                <>
                  <Ionicons name="image-outline" size={26} color={colors.textMuted} />
                  <Text style={styles.photoText}>{strings.report.chooseImage}</Text>
                </>
              )}
            </Pressable>
            {!!photoError && <Text style={styles.error}>{photoError}</Text>}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={submitting ? strings.report.submitting : strings.report.submit}
            onPress={() => handleSubmit(onValid)()}
            loading={submitting}
          />
        </View>
      </KeyboardAvoidingView>

      <OptionSheet
        visible={issueOpen}
        title={strings.report.pickerTitle}
        options={issueOptions}
        selected={issueType}
        onClose={() => setIssueOpen(false)}
        onSelect={(value) => {
          setValue('issueType', value as ReportForm['issueType'], {
            shouldValidate: true,
          });
          setIssueOpen(false);
        }}
      />

      <OptionSheet
        visible={locationOpen}
        title={strings.report.locationTitle}
        options={locationOptions}
        selected={location}
        onClose={() => setLocationOpen(false)}
        onSelect={(value) => {
          if (value === '__current') {
            void applyCurrentLocation();
            return;
          }
          setValue('location', value);
          setLocationError(null);
          setLocationOpen(false);
        }}
        footer={
          locating ? (
            <View style={styles.locating}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.locatingText}>{strings.common.loading}</Text>
            </View>
          ) : null
        }
      />

      <Modal
        visible={success}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeSuccess}
      >
        <View style={styles.modalRoot}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>{strings.report.successTitle}</Text>
            <Text style={styles.successBody}>{strings.report.successBody}</Text>
            <PrimaryButton
              label={strings.report.successDone}
              onPress={closeSuccess}
              style={styles.successButton}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 16,
  },
  intro: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  field: {
    gap: 7,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  select: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectValue: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  locationValue: {
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  photoBox: {
    minHeight: 96,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  photoBoxDashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: '#FAFBFD',
  },
  photoBoxFilled: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 12,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: '#E5E7EB',
  },
  photoText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  removePhoto: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.danger,
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  locating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  locatingText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  successCard: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    padding: 24,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: colors.text,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  successButton: {
    marginTop: 10,
  },
});
