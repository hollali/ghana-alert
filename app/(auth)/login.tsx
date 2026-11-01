import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthShell, authStyles } from '@/src/components/AuthShell';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { strings } from '@/src/strings';
import { useAuthStore } from '@/src/store/authStore';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = strings.auth.emailRequired;
    if (!password.trim()) nextErrors.password = strings.auth.passwordRequired;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login(email, password);
    router.replace('/(tabs)');
  };

  return (
    <AuthShell
      title={strings.auth.welcomeBack}
      subtitle={strings.auth.loginSubtitle}
      footer={
        <>
          <Text style={authStyles.demo}>{strings.auth.demoNote}</Text>
          <View style={authStyles.row}>
            <Text style={authStyles.prompt}>{strings.auth.noAccount} </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/register')}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text style={authStyles.link}>{strings.auth.signUp}</Text>
            </Pressable>
          </View>
        </>
      }
    >
      <StatusBar style="dark" />
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
        autoComplete="password"
        error={errors.password}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <PrimaryButton
        label={strings.auth.login}
        onPress={submit}
        style={{ marginTop: 4 }}
      />
    </AuthShell>
  );
}
