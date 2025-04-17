
// YouTube API OAuth 2.0 credentials and configuration

// API Key (keep as empty string since it's not used in OAuth flow)
export const API_KEY = '';

// Client ID from Google Cloud Console
export const CLIENT_ID = '474426272719-dvcb1cbcdbc152eaaugavjs7bc87hkfk.apps.googleusercontent.com';

// Automatically use the current domain for redirect
export const REDIRECT_URI = window.location.origin;

// Log the redirect URI for debugging purposes
console.log('YouTube OAuth REDIRECT_URI set to:', REDIRECT_URI);
console.log('Full window location:', {
  origin: window.location.origin,
  pathname: window.location.pathname,
  href: window.location.href
});

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

// Debug function to check token validity - Improved to handle different error scenarios
export const checkTokenValidity = async (accessToken: string): Promise<{isValid: boolean, details?: string}> => {
  if (!accessToken) {
    return { isValid: false, details: 'No token provided' };
  }
  
  try {
    console.log(`Validating token with length: ${accessToken.length}`);
    console.log(`Token validation check (first 10 chars): ${accessToken.substring(0, 10)}...`);
    
    // Get token info directly from Google's tokeninfo endpoint
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Disable cache to ensure fresh validation
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Token validation successful:', data);
      // Additional check to ensure the token belongs to our app
      if (data.aud && data.aud === CLIENT_ID) {
        return { 
          isValid: true, 
          details: `Token valid, expires in ${data.expires_in}s` 
        };
      } else {
        console.warn('Token belongs to different client ID:', data.aud);
        return { 
          isValid: false, 
          details: 'Token belongs to a different application' 
        };
      }
    } else {
      console.error('Token validation failed:', data);
      
      // Handle specific error cases
      if (data.error === 'invalid_token') {
        return { isValid: false, details: 'Invalid token format or signature' };
      } else if (data.error === 'expired_token') {
        return { isValid: false, details: 'Token has expired' };
      } else {
        return { 
          isValid: false, 
          details: `Token invalid: ${data.error_description || data.error || 'Unknown error'}` 
        };
      }
    }
  } catch (error) {
    console.error('Error during token validation:', error);
    return { 
      isValid: false, 
      details: `Error checking token: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
