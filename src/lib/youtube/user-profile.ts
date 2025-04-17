
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
        reject(new Error(`API error: ${response.error.message || 'Unknown error'}`));
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
