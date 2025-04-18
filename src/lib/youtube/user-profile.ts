
import { checkTokenValidity } from './config';

// Function to fetch user profile data
export const fetchUserProfile = async (accessToken: string): Promise<{
  id?: string;
  name: string;
  email: string;
  picture: string;
}> => {
  if (!accessToken) {
    console.error('No access token provided for fetchUserProfile');
    throw new Error('Missing access token');
  }
  
  console.log(`Attempting to fetch user profile with token length: ${accessToken.length}`);
  
  try {
    console.log('Fetching user profile directly');
    
    // Use Google's userinfo endpoint directly
    const apiUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    console.log(`Fetching user profile from: ${apiUrl}`);
    
    // Add cache-busting parameter
    const cacheBuster = `?_=${Date.now()}`;
    
    const response = await fetch(apiUrl + cacheBuster, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const status = response.status;
      console.error(`Profile fetch failed with status: ${status}`);
      
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Error response:', errorText);
      } catch (e) {
        console.error('Could not read error response:', e);
      }
      
      if (status === 401) {
        throw new Error('Token rejected by Google: Please sign in again');
      } else if (status === 403) {
        throw new Error('Insufficient permissions to access your profile');
      } else {
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
    
    // Store email for future sign-in hints
    if (data.email) {
      localStorage.setItem('youtube_email', data.email);
    }
    
    // Return normalized user profile
    return {
      id: data.id,
      name: data.name || 'YouTube User',
      email: data.email || '',
      picture: data.picture || ''
    };
  } catch (error) {
    console.error('Profile fetch failed:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};
