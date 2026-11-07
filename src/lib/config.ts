/**
 * ERP backend origin from Expo public env.
 * Set in `.env`: EXPO_PUBLIC_API_URL=https://erp.echinamart.com
 */
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://erp.echinamart.com'
).replace(/\/$/, '');

/** Public storefront origin (share / deep links). */
export const STORE_URL = 'https://echinamart.com';

export const API_KEY = 'EgyChina_Secret_2026_xyz';

/**
 * Rewrite image/upload URLs saved against the old domains so they keep loading
 * after the move to echinamart.com.
 */
export function normalizeImageUrl(url: string): string {
  return url
    .replace(/https?:\/\/erp\.elobour\.store/gi, 'https://erp.echinamart.com')
    .replace(/https?:\/\/(?:www\.)?elobour\.store/gi, 'https://echinamart.com');
}

/** Headers sent on every driver API request. */
export function apiHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    Accept: 'application/json',
    'x-api-key': API_KEY,
    ...extra,
  };
}
