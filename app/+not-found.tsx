import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { strings } from '@/src/strings';
import { colors } from '@/src/theme/tokens';

export default function NotFoundScreen() {
  return (
    <Screen edges={['top', 'bottom']} background={colors.background}>
      <StatusBar style="dark" />
      <EmptyState
        icon="compass-outline"
        title={strings.common.notFoundTitle}
        message={strings.common.notFoundBody}
        actionLabel={strings.common.goHome}
        onAction={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}
