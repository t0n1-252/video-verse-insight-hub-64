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
  console.log(`Token first/last 5 chars: ${accessToken.substring(0, 5)}...${accessToken.substring(accessToken.length - 5)}`);
  
  // First validate the token before attempting to use it
  console.log('Validating token before use...');
  const tokenStatus = await checkTokenValidity(accessToken);
  console.log('Token validation result:', tokenStatus);
  
  if (!tokenStatus.isValid) {
    console.error('Token validation failed:', tokenStatus.details);
    throw new Error(`Invalid or expired access token: ${tokenStatus.details}`);
  }
  
  try {
    console.log('Token validation passed, attempting user profile fetch with fetch API');
    const apiUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
    console.log(`Fetching from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      // Disable cache to ensure we're not getting stale responses
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const status = response.status;
      console.error(`Profile fetch failed with status: ${status}`);
      
      // Extract error details from the response if possible
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
        console.error('Error details:', errorDetails);
      } catch (e) {
        // Unable to parse error response
        console.error('Could not parse error response:', e);
      }
      
      if (status === 401) {
        console.error('401 Unauthorized: Token is invalid or expired');
        throw new Error(`Invalid or expired access token: ${errorDetails}`);
      } else if (status === 403) {
        console.error('403 Forbidden: Insufficient permissions or quota exceeded');
        throw new Error(`Insufficient permissions or quota exceeded: ${errorDetails}`);
      } else if (status === 500) {
        console.error('500 Server Error: Google API server error');
        throw new Error('Server error occurred, please try again later');
      } else {
        console.error(`HTTP Error ${status}: Unexpected status code`);
        throw new Error(`HTTP Error ${status}${errorDetails ? ': ' + errorDetails : ''}`);
      }
    }
    
    const data = await response.json();
    console.log('User profile data retrieved successfully:', JSON.stringify(data, null, 2));
    
    if (data && data.name) {
      return {
        name: data.name || 'YouTube User',
        email: data.email || '',
        picture: data.picture || ''
      };
    } else {
      console.error('Invalid response format from Google API:', data);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Profile fetch failed:', error);
    
    // If the error is already formatted (from our checks above), just rethrow it
    if (error instanceof Error) {
      throw error;
    }
    
    // Otherwise, create a generic error
    throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : String(error)}`);
  }
};
