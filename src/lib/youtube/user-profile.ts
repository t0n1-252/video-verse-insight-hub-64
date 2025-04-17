
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
  
  try {
    console.log('Attempting direct user profile fetch with fetch API');
    const apiUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
    console.log(`Fetching from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
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
        throw new Error(`401: Invalid or expired access token. ${errorDetails}`);
      } else if (status === 403) {
        console.error('403 Forbidden: Insufficient permissions or quota exceeded');
        throw new Error(`403: Insufficient permissions or quota exceeded. ${errorDetails}`);
      } else if (status === 500) {
        console.error('500 Server Error: Google API server error');
        throw new Error('500: Server error occurred, please try again later');
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
    
    // Check if token is expired or invalid before trying JSONP
    if (error instanceof Error && error.message.includes('401:')) {
      console.error('Token is invalid or expired, no need to try JSONP');
      throw error; // Re-throw the token error to trigger re-authentication
    }
    
    // If the error is already formatted (from our checks above), just rethrow it
    if (error instanceof Error && (
        error.message.startsWith('401:') || 
        error.message.startsWith('403:') || 
        error.message.startsWith('500:'))) {
      throw error;
    }
    
    // Otherwise, we'll try a fallback approach with JSONP
    console.log('Trying JSONP fallback approach');
    try {
      return await fetchProfileWithJsonp(accessToken);
    } catch (jsonpError) {
      console.error('JSONP fallback also failed:', jsonpError);
      
      // If JSONP also fails with a 401 error, indicate the token is invalid
      if (jsonpError instanceof Error && jsonpError.message.includes('401')) {
        throw new Error('401: Invalid or expired access token');
      }
      
      throw jsonpError; // Re-throw the JSONP error
    }
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
        console.log('User profile data retrieved successfully via JSONP:', response);
        resolve({
          name: response.name || 'YouTube User',
          email: response.email || '',
          picture: response.picture || ''
        });
      } else if (response && response.error) {
        console.error('Google API returned an error via JSONP:', response.error);
        let errorMessage = `API error: ${response.error.message || 'Unknown error'}`;
        
        // Add more specific error information
        if (response.error.status === '401') {
          errorMessage = '401: Invalid or expired access token';
        } else if (response.error.status === '403') {
          errorMessage = '403: Insufficient permissions or quota exceeded';
        }
        
        reject(new Error(errorMessage));
      } else {
        console.error('Invalid response format from Google API via JSONP');
        reject(new Error('Invalid response format'));
      }
    };
    
    // Create a script URL with the callback
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}&callback=${callbackName}`;
    console.log(`JSONP URL: ${url.substring(0, 60)}...`); // Log partial URL to not expose full token
    
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
