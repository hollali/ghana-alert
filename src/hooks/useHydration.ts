import { useSyncExternalStore } from 'react';

import { useAuthStore } from '@/src/store/authStore';

export function useHydration(): boolean {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
