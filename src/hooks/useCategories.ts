import { useCallback, useEffect, useState } from 'react';

import { categories as mockCategories } from '@/src/data/categories';
import { mapCategory, publicFetch } from '@/src/lib/api';
import type { Category } from '@/src/types';

async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await publicFetch('/api/categories');
    if (!response.ok) throw new Error(`Categories API ${response.status}`);
    const rows = (await response.json()) as { slug: string; name: string; description: string }[];
    const mapped = rows.map(mapCategory);
    if (mapped.length === 0) throw new Error('Categories API returned no rows, using mock');
    return mapped;
  } catch (error) {
    if (__DEV__) console.warn('[api] Falling back to mock categories:', error);
    return [...mockCategories];
  }
}

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await fetchCategories();
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
      const result = await fetchCategories();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, refetch };
}
