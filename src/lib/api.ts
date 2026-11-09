import { API_BASE_URL } from '@/src/config/auth';
import { getAccessToken } from '@/src/lib/neonAuth';
import type { Alert, Category } from '@/src/types';

export async function authenticatedFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, { ...init, headers, credentials: 'omit' });
}

export async function publicFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, { ...init, headers, credentials: 'omit' });
}

interface AlertRow {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  priority: string;
  source: string;
  published_at?: string;
  publishedAt?: string;
  affected_products?: unknown;
  affectedProducts?: unknown;
  recommended_actions?: unknown;
  recommendedActions?: unknown;
  image_url?: string | null;
  imageUrl?: string | null;
  view_count?: number;
  viewCount?: number;
}

export function mapAlert(row: AlertRow): Alert {
  return {
    id: String(row.id),
    title: row.title,
    summary: row.summary,
    body: row.body,
    category: row.category as Alert['category'],
    priority: row.priority as Alert['priority'],
    source: row.source,
    publishedAt: row.published_at ?? row.publishedAt ?? new Date().toISOString(),
    affectedProducts: (row.affected_products ?? row.affectedProducts) as
      | Alert['affectedProducts']
      | undefined,
    recommendedActions: (row.recommended_actions ?? row.recommendedActions) as
      | Alert['recommendedActions']
      | undefined,
    imageUrl: row.image_url ?? row.imageUrl ?? undefined,
    viewCount: row.view_count ?? row.viewCount ?? 0,
  };
}

export function mapCategory(row: {
  slug: string;
  name: string;
  description: string;
}): Category {
  return {
    slug: row.slug as Category['slug'],
    name: row.name,
    description: row.description,
  };
}
