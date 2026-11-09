import { useCallback, useEffect, useState } from 'react';

import { alerts as mockAlerts } from '@/src/data/alerts';
import { mapAlert, publicFetch } from '@/src/lib/api';
import type { Alert } from '@/src/types';

async function fetchAlerts(): Promise<Alert[]> {
  try {
    const response = await publicFetch('/api/alerts');
    if (!response.ok) throw new Error(`Alerts API ${response.status}`);
    const rows = (await response.json()) as ReturnType<typeof mapAlert>[];
    // API returns snake_case rows; mapAlert handles both shapes
    const mapped = (rows as unknown as Parameters<typeof mapAlert>[0][]).map(mapAlert);
    if (mapped.length === 0) throw new Error('Alerts API returned no rows, using mock');
    return mapped;
  } catch (error) {
    if (__DEV__) console.warn('[api] Falling back to mock alerts:', error);
    return [...mockAlerts];
  }
}

async function fetchAlert(id?: string): Promise<Alert | undefined> {
  if (!id) return undefined;
  try {
    const response = await publicFetch(`/api/alerts/${id}`);
    if (!response.ok) throw new Error(`Alert API ${response.status}`);
    const row = (await response.json()) as Parameters<typeof mapAlert>[0];
    return mapAlert(row);
  } catch (error) {
    if (__DEV__) console.warn('[api] Falling back to mock alert:', error);
    return mockAlerts.find((item) => item.id === id);
  }
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
