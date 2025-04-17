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
  
  try {
    console.log('Attempting direct user profile fetch with fetch API');
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      const status = response.status;
      console.error(`Profile fetch failed with status: ${status}`);
      
      if (status === 401) {
        throw new Error('401: Invalid or expired access token');
      } else if (status === 403) {
        throw new Error('403: Insufficient permissions or quota exceeded');
      } else if (status === 500) {
        throw new Error('500: Server error occurred, please try again later');
      } else {
        throw new Error(`HTTP Error ${status}`);
      }
    }
    
    const data = await response.json();
    console.log('User profile data retrieved successfully');
    
    if (data && data.name) {
      return {
        name: data.name || 'YouTube User',
        email: data.email || '',
        picture: data.picture || ''
      };
    } else {
      console.error('Invalid response format from Google API');
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Profile fetch failed:', error);
    
    // If the error is already formatted (from our checks above), just rethrow it
    if (error instanceof Error && (error.message.startsWith('401:') || 
        error.message.startsWith('403:') || 
        error.message.startsWith('500:'))) {
      throw error;
    }
    
    // Otherwise, we'll try a fallback approach with JSONP
    console.log('Trying JSONP fallback approach');
    return await fetchProfileWithJsonp(accessToken);
  }
};

// JSONP fallback approach as a separate function
const fetchProfileWithJsonp = (accessToken: string): Promise<{
  name: string;
  email: string;
  picture: string;
}> => {
  return new Promise((resolve, reject) => {
    // Create a direct script tag to bypass CORS
    const script = document.createElement('script');
    const callbackName = 'handleGoogleUserProfile_' + Math.random().toString(36).substring(2, 15);
    
    // Create a global callback function that Google will call
    window[callbackName] = (response: any) => {
      // Clean up
      delete window[callbackName];
      document.body.removeChild(script);
      
      if (response && response.name) {
        console.log('User profile data retrieved successfully via JSONP');
        resolve({
          name: response.name || 'YouTube User',
          email: response.email || '',
          picture: response.picture || ''
        });
      } else if (response && response.error) {
        console.error('Google API returned an error:', response.error);
        let errorMessage = `API error: ${response.error.message || 'Unknown error'}`;
        
        // Add more specific error information
        if (response.error.status === '401') {
          errorMessage = '401: Invalid or expired access token';
        } else if (response.error.status === '403') {
          errorMessage = '403: Insufficient permissions or quota exceeded';
        }
        
        reject(new Error(errorMessage));
      } else {
        console.error('Invalid response format from Google API');
        reject(new Error('Invalid response format'));
      }
    };
    
    // Create a script URL with the callback
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}&callback=${callbackName}`;
    script.src = url;
    script.async = true;
    script.onerror = () => {
      delete window[callbackName];
      document.body.removeChild(script);
      console.error('Script loading error for user profile fetch');
      reject(new Error('Failed to load user profile script'));
    };
    
    // Add the script to the document
    document.body.appendChild(script);
    
    // Set a timeout in case Google never calls our callback
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        document.body.removeChild(script);
        console.error('Timeout while fetching user profile via JSONP');
        reject(new Error('Request timed out'));
      }
    }, 15000); // 15 seconds timeout
  });
};
