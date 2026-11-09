import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthShell, authStyles } from '@/src/components/AuthShell';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { strings } from '@/src/strings';
import { useAuthStore } from '@/src/store/authStore';

export default function VerifyScreen() {
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerification = useAuthStore((state) => state.resendVerification);
  const isLoading = useAuthStore((state) => state.isLoading);
  const pendingEmail = useAuthStore((state) => state.pendingEmail);
  const storeError = useAuthStore((state) => state.error);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{ code?: string; form?: string }>({});
  const [resent, setResent] = useState(false);

  const submit = async () => {
    if (!code.trim()) {
      setErrors({ code: strings.auth.verifyCodeRequired });
      return;
    }
    try {
      await verifyEmail(code);
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Verification failed.' });
    }
  };

  const resend = async () => {
    try {
      await resendVerification();
      setResent(true);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Resend failed.' });
    }
  };

  return (
    <AuthShell
      title={strings.auth.verifyTitle}
      subtitle={strings.auth.verifySubtitle}
      footer={
        <>
          {!!pendingEmail && (
            <Text style={authStyles.demo}>{pendingEmail}</Text>
          )}
          <Text style={authStyles.demo}>{strings.auth.verifyCheckEmail}</Text>
          <Text style={authStyles.demo}>{strings.auth.verifyExpired}</Text>
          <View style={authStyles.row}>
            <Pressable
              onPress={() => void resend()}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={authStyles.link}>{strings.auth.resendButton}</Text>
            </Pressable>
          </View>
          {resent && !storeError ? (
            <Text style={authStyles.demo}>{strings.auth.verifyCheckEmail}</Text>
          ) : null}
          <View style={authStyles.row}>
            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text style={authStyles.link}>{strings.auth.backToSignIn}</Text>
            </Pressable>
          </View>
        </>
      }
    >
      <StatusBar style="dark" />
      <FormField
        label={strings.auth.verifyCode}
        placeholder={strings.auth.verifyCodePlaceholder}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        autoCapitalize="none"
        autoComplete="one-time-code"
        error={errors.code}
        returnKeyType="done"
        onSubmitEditing={() => void submit()}
      />
      {(errors.form ?? storeError) ? (
        <Text style={authStyles.demo}>{errors.form ?? storeError}</Text>
      ) : null}
      <Text style={authStyles.demo}>{strings.auth.verifyLinkFallback}</Text>
      <PrimaryButton
        label={strings.auth.verifyButton}
        onPress={() => void submit()}
        loading={isLoading}
        disabled={isLoading}
        style={{ marginTop: 4 }}
      />
    </AuthShell>
  );
}
