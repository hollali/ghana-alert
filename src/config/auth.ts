export const NEON_AUTH_URL = process.env.EXPO_PUBLIC_NEON_AUTH_URL ?? '';
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export function getNeonAuthUrl(): string {
  const url = NEON_AUTH_URL.trim();
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_NEON_AUTH_URL is missing. Set it to your Neon Auth base URL (from Neon Console > Auth > Configuration).',
    );
  }
  return url.replace(/\/$/, '');
}
