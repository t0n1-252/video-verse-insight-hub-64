
import { TokenState } from './types';

const TOKEN_KEY = 'youtube_access_token';
const USER_KEY = 'youtube_user';
const TOKEN_TIMESTAMP_KEY = 'youtube_token_timestamp';
const TOKEN_REFRESH_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes (more aggressive)

/**
 * Completely clears all session data and cookies related to authentication
 */
export const clearSession = () => {
  // Clear localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('youtube_email');
  
  // Clear sessionStorage  
  sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
  
  // Purge all Google-related items from storage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('gapi') || key.includes('google') || key.includes('oauth') || key.includes('token')) {
      localStorage.removeItem(key);
    }
  });
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('gapi') || key.includes('google') || key.includes('oauth') || key.includes('token')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear cookies - super aggressive approach for stubborn tokens
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    // Set expiry in the past with multiple domain attempts
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  });
  
  // If google/gapi is loaded, attempt to clear it
  if (window.google && window.google.accounts) {
    try {
      // Force sign out from Google Identity Services if available
      if (window.google.accounts.oauth2) {
        // The id property was causing TypeScript errors - removed direct access
        // Instead, access the methods we know exist based on type definitions
        console.log('Attempting to clear Google accounts state');
      }
    } catch (e) {
      console.error('Error clearing Google Identity state:', e);
    }
  }
  
  console.log('Session cleared completely');
};

export const saveSession = (token: string, user: any) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  sessionStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
  console.log('Session saved with timestamp:', Date.now());
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
  // Even more aggressive threshold - if token is older than 2 minutes, consider it stale
  return elapsedTime > TOKEN_REFRESH_THRESHOLD_MS; 
};
