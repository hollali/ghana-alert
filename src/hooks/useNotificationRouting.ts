import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuthStore } from '@/src/store/authStore';

function openAlert(response: Notifications.NotificationResponse | null) {
  const alertId = response?.notification.request.content.data?.alertId;
  if (typeof alertId === 'string' || typeof alertId === 'number') {
    router.push(`/alert/${alertId}`);
  }
}

export function useNotificationRouting(enabled: boolean) {
  const lastHandled = useRef<string | null>(null);
  const pendingAlertId = useRef<string | null>(null);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const identifier = response.notification.request.identifier;
      const alertId = response.notification.request.content.data?.alertId;
      if (!isLoggedIn) {
        if (typeof alertId === 'string' || typeof alertId === 'number') {
          pendingAlertId.current = String(alertId);
        }
        void Notifications.clearLastNotificationResponseAsync();
        return;
      }
      if (lastHandled.current === identifier) return;
      lastHandled.current = identifier;
      openAlert(response);
      void Notifications.clearLastNotificationResponseAsync();
    };

    const subscription =
      Notifications.addNotificationResponseReceivedListener(handleResponse);

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const identifier = response.notification.request.identifier;
      const alertId = response.notification.request.content.data?.alertId;
      if (!isLoggedIn) {
        if (typeof alertId === 'string' || typeof alertId === 'number') {
          pendingAlertId.current = String(alertId);
        }
        void Notifications.clearLastNotificationResponseAsync();
        return;
      }
      if (lastHandled.current === identifier) return;
      lastHandled.current = identifier;
      openAlert(response);
      void Notifications.clearLastNotificationResponseAsync();
    });

    return () => subscription.remove();
  }, [enabled, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !pendingAlertId.current) return;
    const alertId = pendingAlertId.current;
    pendingAlertId.current = null;
    router.push(`/alert/${alertId}`);
  }, [isLoggedIn]);
}
