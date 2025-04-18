// YouTube API OAuth 2.0 credentials and configuration

// API Key (keep as empty string since it's not used in OAuth flow)
export const API_KEY = '';

// Client ID from Google Cloud Console
export const CLIENT_ID = '243997867776-i32hk67546ieolvmcng19ijgsesbve3d.apps.googleusercontent.com';

// Client Secret from Google Cloud Console
export const CLIENT_SECRET = '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';

// Scopes needed for the application
export const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube'
];

// Use the full origin (domain) as the redirect URI without the path
export const REDIRECT_URI = window.location.origin;

// Log the redirect URI for debugging purposes
console.log('YouTube OAuth REDIRECT_URI set to:', REDIRECT_URI);
console.log('Full window location:', {
  origin: window.location.origin,
  pathname: window.location.pathname,
  href: window.location.href
});

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

// Enhanced token validation with more robust error handling
export const checkTokenValidity = async (accessToken: string): Promise<{isValid: boolean, details?: string}> => {
  if (!accessToken) {
    return { isValid: false, details: 'No token provided' };
  }
  
  try {
    console.log(`Validating token with length: ${accessToken.length}`);
    
    // First try the userinfo endpoint (more reliable)
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        }
      });
      
      if (response.ok) {
        console.log('Token validated successfully with userinfo endpoint');
        return { isValid: true, details: 'Token valid - verified with userinfo endpoint' };
      }
      
      // Get error details
      const errorText = await response.text();
      console.error('Userinfo validation error:', response.status, errorText);
      
      if (response.status === 401) {
        return { isValid: false, details: 'Token has been revoked or expired' };
      }
      
      console.log('Userinfo validation failed, trying tokeninfo endpoint');
    } catch (e) {
      console.error('Error during userinfo validation:', e);
      console.log('Falling back to tokeninfo endpoint');
    }
    
    // Fallback to tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      }
    });
    
    // Handle HTTP errors
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
    
    // Parse the response
    const data = await response.json();
    console.log('Token validation response:', data);
    
    // Check for explicit errors
    if (data.error) {
      console.error('Token validation returned error:', data.error);
      return { 
        isValid: false, 
        details: `Token invalid: ${data.error_description || data.error}` 
      };
    }
    
    // For valid tokens, verify it's for our application
    if (data.audience || data.azp) {
      const tokenClientId = data.audience || data.azp;
      
      if (tokenClientId === CLIENT_ID) {
        console.log('Token is valid for our application');
        return { isValid: true, details: 'Token valid and belongs to our application' };
      } else {
        console.warn('Token belongs to different client ID:', tokenClientId);
        return { 
          isValid: false, 
          details: 'Token belongs to a different application' 
        };
      }
    }
    
    // If we have an 'exp' field, the token is probably valid
    if (data.exp) {
      return { isValid: true, details: 'Token appears valid based on expiration time' };
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
