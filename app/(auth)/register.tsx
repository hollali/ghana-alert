import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthShell, authStyles } from '@/src/components/AuthShell';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { strings } from '@/src/strings';
import { useAuthStore } from '@/src/store/authStore';

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});

  const submit = async () => {
    const nextErrors: {
      name?: string;
      email?: string;
      password?: string;
    } = {};
    if (!name.trim()) nextErrors.name = strings.auth.nameRequired;
    if (!email.trim()) nextErrors.email = strings.auth.emailRequired;
    if (!password.trim()) nextErrors.password = strings.auth.passwordRequired;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await register(name, email, password);
      if (useAuthStore.getState().needsVerification) {
        router.replace('/(auth)/verify');
        return;
      }
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Registration failed.',
      });
    }
  };

  return (
    <AuthShell
      title={strings.auth.createAccount}
      subtitle={strings.auth.registerSubtitle}
      footer={
        <>
          <View style={authStyles.row}>
            <Text style={authStyles.prompt}>{strings.auth.haveAccount} </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text style={authStyles.link}>{strings.auth.signIn}</Text>
            </Pressable>
          </View>
        </>
      }
    >
      <StatusBar style="dark" />
      <FormField
        label={strings.auth.name}
        placeholder={strings.auth.namePlaceholder}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        error={errors.name}
        returnKeyType="next"
      />
      <FormField
        label={strings.auth.email}
        placeholder={strings.auth.emailPlaceholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        returnKeyType="next"
      />
      <FormField
        label={strings.auth.password}
        placeholder={strings.auth.passwordPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        error={errors.password}
        returnKeyType="done"
        onSubmitEditing={() => void submit()}
      />
      {(errors.form ?? storeError) ? (
        <Text style={authStyles.demo}>{errors.form ?? storeError}</Text>
      ) : null}
      <PrimaryButton
        label={strings.auth.register}
        onPress={() => void submit()}
        loading={isLoading}
        disabled={isLoading}
        style={{ marginTop: 4 }}
      />
    </AuthShell>
  );
}
