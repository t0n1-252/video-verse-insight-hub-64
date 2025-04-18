
import { TokenState } from './types';

const TOKEN_KEY = 'youtube_access_token';
const USER_KEY = 'youtube_user';
const TOKEN_TIMESTAMP_KEY = 'youtube_token_timestamp';
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
  // Clear any potential cross-domain cookies that might be causing issues
  document.cookie.split(';').forEach(c => {
    const cookieName = c.split('=')[0].trim();
    if (cookieName.startsWith('g_') || cookieName.includes('google')) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
};

export const saveSession = (token: string, user: any) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
};

export const getStoredSession = (): TokenState => {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const timestamp = sessionStorage.getItem(TOKEN_TIMESTAMP_KEY);
  return {
    accessToken,
    timestamp: timestamp ? parseInt(timestamp, 10) : null
  };
};

export const isTokenStale = (timestamp: number | null): boolean => {
  if (!timestamp) return true;
  const now = Date.now();
  const elapsedTime = now - timestamp;
  console.log(`Token age check: ${elapsedTime / 1000}s elapsed (threshold: ${TOKEN_REFRESH_THRESHOLD_MS / 1000}s)`);
  // Make the threshold stricter to prevent using nearly-expired tokens
  return elapsedTime > TOKEN_REFRESH_THRESHOLD_MS;
};
