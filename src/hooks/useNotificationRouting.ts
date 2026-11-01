import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

function openAlert(response: Notifications.NotificationResponse | null) {
  const alertId = response?.notification.request.content.data?.alertId;
  if (typeof alertId === 'string' || typeof alertId === 'number') {
    router.push(`/alert/${alertId}`);
  }
}

export function useNotificationRouting(enabled: boolean) {
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const identifier = response.notification.request.identifier;
      if (lastHandled.current === identifier) return;
      lastHandled.current = identifier;
      openAlert(response);
    };

    const subscription =
      Notifications.addNotificationResponseReceivedListener(handleResponse);

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const identifier = response.notification.request.identifier;
      if (lastHandled.current === identifier) return;
      lastHandled.current = identifier;
      openAlert(response);
      void Notifications.clearLastNotificationResponseAsync();
    });

    return () => subscription.remove();
  }, [enabled]);
}
