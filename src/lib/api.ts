import { API_BASE_URL } from '@/src/config/auth';
import { getAccessToken } from '@/src/lib/neonAuth';

export async function authenticatedFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, { ...init, headers, credentials: 'omit' });
}
