// YouTube API OAuth 2.0 credentials and configuration

// API Key (keep as empty string since it's not used in OAuth flow)
export const API_KEY = '';

// Client ID from Google Cloud Console
export const CLIENT_ID = '474426272719-dvcb1cbcdbc152eaaugavjs7bc87hkfk.apps.googleusercontent.com';

// Client Secret from Google Cloud Console
export const CLIENT_SECRET = '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';

// Use the full origin (domain) as the redirect URI without the path
// This is simpler and more reliable for OAuth flows
export const REDIRECT_URI = window.location.origin;

// Log the redirect URI for debugging purposes
console.log('YouTube OAuth REDIRECT_URI set to:', REDIRECT_URI);
console.log('Full window location:', {
  origin: window.location.origin,
  pathname: window.location.pathname,
  href: window.location.href
});

// Scopes needed for the application
// Added "https://www.googleapis.com/auth/youtube" to ensure we have full access
export const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube'
];

// Initial auth state
export const initialAuthState = {
  isSignedIn: false,
  accessToken: null,
  user: null
};

// Check if credentials are configured
export const areCredentialsConfigured = () => {
  return CLIENT_ID.trim() !== '' && CLIENT_SECRET.trim() !== '';
};

// Debug function to check token validity - Enhanced to handle different error scenarios
export const checkTokenValidity = async (accessToken: string): Promise<{isValid: boolean, details?: string}> => {
  if (!accessToken) {
    return { isValid: false, details: 'No token provided' };
  }
  
  try {
    console.log(`Validating token with length: ${accessToken.length}`);
    console.log(`Token validation check (first 10 chars): ${accessToken.substring(0, 10)}...`);
    console.log('Current path during token validation:', window.location.pathname);
    
    // Use tokeninfo endpoint for validation - using a more direct approach
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add no-cors mode to avoid CORS issues when in development
      cache: 'no-store'
    });
    
    // Handle HTTP errors first
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token validation HTTP error:', response.status, errorText);
      
      if (response.status === 400) {
        return { isValid: false, details: 'Invalid token format' };
      } else if (response.status === 401) {
        return { isValid: false, details: 'Token has been revoked or expired' };
      } else {
        return { isValid: false, details: `Token validation failed with status: ${response.status}` };
      }
    }
    
    // Parse the response if HTTP status is ok
    const data = await response.json();
    console.log('Token validation response:', data);
    
    // Check for explicit errors in the response body
    if (data.error) {
      console.error('Token validation returned error:', data.error);
      return { 
        isValid: false, 
        details: `Token invalid: ${data.error_description || data.error}` 
      };
    }
    
    // For valid tokens, verify it's for our application
    if (data.audience) {
      console.log('Token audience:', data.audience);
      console.log('Our client ID:', CLIENT_ID);
      
      if (data.audience === CLIENT_ID) {
        console.log('Token is valid for our application');
        return { isValid: true, details: 'Token valid and belongs to our application' };
      } else {
        console.warn('Token belongs to different client ID:', data.audience);
        return { 
          isValid: false, 
          details: 'Token belongs to a different application' 
        };
      }
    }
    
    // If we get here with no error but no audience, something is wrong
    return { isValid: false, details: 'Invalid token response format' };
  } catch (error) {
    console.error('Error during token validation:', error);
    return { 
      isValid: false, 
      details: `Error checking token: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
