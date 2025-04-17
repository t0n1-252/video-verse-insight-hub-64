import { checkTokenValidity } from './config';

// Function to fetch user profile data
export const fetchUserProfile = async (accessToken: string): Promise<{
  name: string;
  email: string;
  picture: string;
}> => {
  if (!accessToken) {
    console.error('No access token provided for fetchUserProfile');
    throw new Error('Missing access token');
  }
  
  console.log(`Attempting to fetch user profile with token length: ${accessToken.length}`);
  console.log(`Token first/last 10 chars: ${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 10)}`);
  
  // First validate the token before attempting to use it
  console.log('Validating token before use...');
  const tokenStatus = await checkTokenValidity(accessToken);
  console.log('Token validation result:', tokenStatus);
  
  if (!tokenStatus.isValid) {
    console.error('Token validation failed:', tokenStatus.details);
    throw new Error(`Invalid or expired access token: ${tokenStatus.details}`);
  }
  
  try {
    console.log('Token validation passed, fetching user profile from Google API');
    
    // Use Google's userinfo endpoint from OAuth2 v2 API
    const apiUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    console.log(`Fetching from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      // Disable cache to ensure fresh response
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const status = response.status;
      console.error(`Profile fetch failed with status: ${status}`);
      
      let errorText = '';
      try {
        const errorData = await response.text();
        errorText = errorData;
        console.error('Error response:', errorText);
      } catch (e) {
        console.error('Could not read error response:', e);
      }
      
      // Throw detailed error based on status code
      if (status === 401) {
        console.error('401 Unauthorized: Token has been rejected by Google API');
        throw new Error('Token rejected by Google: Please sign in again');
      } else if (status === 403) {
        console.error('403 Forbidden: Insufficient permissions');
        throw new Error('Insufficient permissions to access your profile');
      } else {
        console.error(`HTTP Error ${status}: Unexpected error`);
        throw new Error(`Error fetching profile: ${errorText || `HTTP ${status}`}`);
      }
    }
    
    // Parse the response JSON
    const data = await response.json();
    console.log('User profile data retrieved:', JSON.stringify(data, null, 2));
    
    if (!data || !data.name) {
      console.error('Invalid profile data format:', data);
      throw new Error('Received invalid profile data format');
    }
    
    // Return normalized user profile
    return {
      name: data.name || 'YouTube User',
      email: data.email || '',
      picture: data.picture || ''
    };
  } catch (error) {
    console.error('Profile fetch failed:', error);
    
    // If the error is already an Error object, just rethrow it
    if (error instanceof Error) {
      throw error;
    }
    
    // Otherwise create a new Error with the message
    throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : String(error)}`);
  }
};
