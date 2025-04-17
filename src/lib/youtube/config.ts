
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

// Debug function to check token validity - Fixed to properly validate tokens
export const checkTokenValidity = async (accessToken: string): Promise<{isValid: boolean, details?: string}> => {
  if (!accessToken) {
    return { isValid: false, details: 'No token provided' };
  }
  
  try {
    // Create a URL with the token as a query parameter
    const url = new URL('https://www.googleapis.com/oauth2/v1/tokeninfo');
    url.searchParams.append('access_token', accessToken);
    
    console.log(`Validating token (first/last 5 chars): ${accessToken.substring(0, 5)}...${accessToken.substring(accessToken.length - 5)}`);
    
    // Make the validation request
    const validationResponse = await fetch(url.toString(), {
      method: 'GET',
      // Disable cache to ensure fresh validation
      cache: 'no-store'
    });
    
    // Parse the response
    if (validationResponse.ok) {
      const data = await validationResponse.json();
      console.log('Token validation successful, details:', data);
      return { 
        isValid: true, 
        details: `Token valid for ${data.scope}, expires in ${data.expires_in}s` 
      };
    } else {
      const errorData = await validationResponse.json();
      console.error('Token validation failed:', errorData);
      return { 
        isValid: false, 
        details: `Token invalid: ${errorData.error_description || errorData.error || 'Unknown error'}` 
      };
    }
  } catch (error) {
    console.error('Error during token validation:', error);
    return { 
      isValid: false, 
      details: `Error checking token: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
