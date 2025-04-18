
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

// Use the exact domain of the current application for redirect
export const REDIRECT_URI = window.location.origin;

// Log the redirect URI for debugging purposes
console.log('YouTube OAuth REDIRECT_URI set to:', REDIRECT_URI);
console.log('Full window location:', {
  origin: window.location.origin,
  pathname: window.location.pathname,
  href: window.location.href,
  domain: window.location.hostname
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

// Ultra-robust token validation with multiple fallbacks
export const checkTokenValidity = async (accessToken: string): Promise<{isValid: boolean, details?: string}> => {
  if (!accessToken) {
    return { isValid: false, details: 'No token provided' };
  }
  
  try {
    console.log(`Validating token with length: ${accessToken.length}`);
    
    // Try multiple validation methods in sequence
    
    // 1. First try the userinfo endpoint (most reliable for Google OAuth)
    try {
      console.log('Trying userinfo endpoint for validation...');
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        // Add random cache-busting parameter
        cache: 'no-store'
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
      
      console.log('Userinfo validation failed, trying alternative endpoints');
    } catch (e) {
      console.error('Error during userinfo validation:', e);
      console.log('Falling back to tokeninfo endpoint');
    }
    
    // 2. Try the tokeninfo endpoint
    try {
      console.log('Trying tokeninfo endpoint for validation...');
      const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`;
      console.log('Validating token with URL:', tokenInfoUrl);
      
      const response = await fetch(tokenInfoUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store'
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
      if (data.audience || data.azp || data.client_id) {
        const tokenClientId = data.audience || data.azp || data.client_id;
        
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
        const expirationTime = parseInt(data.exp, 10) * 1000; // Convert to milliseconds
        const now = Date.now();
        
        if (expirationTime > now) {
          console.log(`Token is valid and expires in ${Math.floor((expirationTime - now) / 1000)} seconds`);
          return { isValid: true, details: 'Token appears valid based on expiration time' };
        } else {
          console.error('Token has expired according to exp field');
          return { isValid: false, details: 'Token has expired' };
        }
      }
      
      // If we get here with no error but no audience, something is wrong
      return { isValid: false, details: 'Invalid token response format' };
    } catch (e) {
      console.error('Error during tokeninfo validation:', e);
      // Continue to the next fallback
    }
    
    // 3. Final attempt: try a YouTube API endpoint as a last resort
    try {
      console.log('Making final validation attempt with YouTube API endpoint...');
      const ytResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store'
      });
      
      if (ytResponse.ok) {
        console.log('Token validated successfully through YouTube API');
        return { isValid: true, details: 'Token valid - verified with YouTube API' };
      }
      
      const ytErrorText = await ytResponse.text();
      console.error('YouTube API validation error:', ytResponse.status, ytErrorText);
      return { isValid: false, details: 'Token rejected by YouTube API' };
    } catch (e) {
      console.error('Error during YouTube API validation:', e);
    }
    
    // All validation attempts failed
    return { 
      isValid: false, 
      details: 'Token validation failed through all methods' 
    };
  } catch (error) {
    console.error('Error during token validation:', error);
    return { 
      isValid: false, 
      details: `Error checking token: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
