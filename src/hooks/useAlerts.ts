import { useCallback, useEffect, useState } from 'react';

import { alerts as mockAlerts } from '@/src/data/alerts';
import type { Alert } from '@/src/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAlerts() {
  await delay(400);
  return [...mockAlerts];
}

async function fetchAlert(id?: string) {
  await delay(400);
  return mockAlerts.find((item) => item.id === id);
}

export function useAlerts() {
  const [data, setData] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await fetchAlerts();
        if (cancelled) return;
        setData(result);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAlerts();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, refetch };
}

export function useAlert(id?: string) {
  const [alert, setAlert] = useState<Alert | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await fetchAlert(id);
        if (cancelled) return;
        setAlert(result);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAlert(id);
      setAlert(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { data: alert, isLoading, error, refetch };
}
