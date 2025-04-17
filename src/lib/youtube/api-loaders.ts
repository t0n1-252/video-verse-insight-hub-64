
import { API_KEY, areCredentialsConfigured } from './config';

// Load the Google Identity Services client library
export const loadGisClient = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById('google-gis-script')) {
      console.log('Google Identity Services already loaded');
      
      // Check if the API is actually available, not just if the script tag exists
      if (window.google && window.google.accounts) {
        resolve();
        return;
      } else {
        console.log('Script tag exists but Google Identity Services not available, will reload');
        // Continue with loading to ensure it's properly initialized
      }
    }
    
    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded successfully');
      // Add a more significant delay to ensure the script is fully initialized
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          resolve();
        } else {
          console.warn('Google Identity Services loaded but not available yet, retrying...');
          // Try again with an even longer delay
          setTimeout(() => {
            if (window.google && window.google.accounts) {
              resolve();
            } else {
              reject(new Error('Google Identity Services not available after loading'));
            }
          }, 500); // Longer delay for more reliability
        }
      }, 200); // Increased delay for initialization
    };
    script.onerror = (error) => {
      console.error('Error loading Google Identity Services:', error);
      reject(error);
    };
    document.body.appendChild(script);
  });
};

// Load the Google API client library
export const loadGapiClient = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById('google-gapi-script')) {
      console.log('Google API client already loaded');
      
      // Check if it's actually initialized
      if (window.gapi && window.gapi.client) {
        resolve();
        return;
      } else {
        console.log('Script tag exists but GAPI client not initialized, will reload');
        // Continue with loading to ensure it's properly initialized
      }
    }
    
    const script = document.createElement('script');
    script.id = 'google-gapi-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize the gapi.client with a delay to ensure proper loading
      setTimeout(() => {
        window.gapi.load('client', async () => {
          try {
            if (!areCredentialsConfigured()) {
              throw new Error('YouTube API credentials not configured');
            }
            
            await window.gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
            });
            console.log('Google API client initialized successfully');
            resolve();
          } catch (error) {
            console.error('Error initializing Google API client:', error);
            reject(error);
          }
        });
      }, 200); // Add delay for more reliable initialization
    };
    script.onerror = (error) => {
      console.error('Error loading Google API client:', error);
      reject(error);
    };
    document.body.appendChild(script);
  });
};
