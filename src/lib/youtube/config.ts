// YouTube API OAuth 2.0 credentials and configuration

// API Key (keep as empty string since it's not used in OAuth flow)
export const API_KEY = '';

// Client ID from Google Cloud Console
export const CLIENT_ID = '474426272719-dvcb1cbcdbc152eaaugavjs7bc87hkfk.apps.googleusercontent.com';

// Automatically use the current domain for redirect
export const REDIRECT_URI = window.location.origin;

// Scopes needed for the application
export const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

// Initial auth state
export const initialAuthState = {
  isSignedIn: false,
  accessToken: null,
  user: null
};

// Check if credentials are configured
export const areCredentialsConfigured = () => {
  return CLIENT_ID.trim() !== '';
};
