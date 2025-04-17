
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

// Debug function to check token validity
export const checkTokenValidity = async (accessToken: string): Promise<{isValid: boolean, details?: string}> => {
  if (!accessToken) {
    return { isValid: false, details: 'No token provided' };
  }
  
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Use query parameter for token validation
      // This endpoint is specifically for validating tokens
      cache: 'no-store'
    });
    
    const url = new URL('https://www.googleapis.com/oauth2/v1/tokeninfo');
    url.searchParams.append('access_token', accessToken);
    
    const validationResponse = await fetch(url.toString());
    
    if (validationResponse.ok) {
      const data = await validationResponse.json();
      return { 
        isValid: true, 
        details: `Token valid for ${data.scope}, expires in ${data.expires_in}s` 
      };
    } else {
      const errorData = await validationResponse.json();
      return { 
        isValid: false, 
        details: `Token invalid: ${errorData.error_description || errorData.error || 'Unknown error'}` 
      };
    }
  } catch (error) {
    return { 
      isValid: false, 
      details: `Error checking token: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
