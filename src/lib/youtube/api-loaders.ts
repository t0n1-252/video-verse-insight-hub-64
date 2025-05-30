
import { API_KEY, areCredentialsConfigured, REDIRECT_URI } from './config';

// Load the Google Identity Services client library
export const loadGisClient = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      console.log('Google Identity Services already loaded and initialized');
      resolve();
      return;
    }
    
    if (document.getElementById('google-gis-script')) {
      console.log('Google Identity Services script tag exists, but API may not be initialized');
      
      // Wait for a short period to see if it initializes
      setTimeout(() => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          console.log('Google Identity Services initialized after waiting');
          resolve();
        } else {
          console.log('Google Identity Services still not available, removing script tag and reloading');
          // Remove the existing script tag to force a clean reload
          const existingScript = document.getElementById('google-gis-script');
          if (existingScript && existingScript.parentNode) {
            existingScript.parentNode.removeChild(existingScript);
          }
          loadScript();
        }
      }, 1000);
      return;
    }
    
    loadScript();
    
    function loadScript() {
      const script = document.createElement('script');
      script.id = 'google-gis-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services script loaded');
        console.log('Current redirect URI:', REDIRECT_URI);
        // Add a more significant delay to ensure the script is fully initialized
        setTimeout(() => {
          if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            console.log('Google Identity Services API initialized successfully');
            resolve();
          } else {
            console.warn('Google Identity Services loaded but API not available yet, retrying...');
            // Try again with an even longer delay
            setTimeout(() => {
              if (window.google && window.google.accounts && window.google.accounts.oauth2) {
                console.log('Google Identity Services API initialized after longer delay');
                resolve();
              } else {
                reject(new Error('Google Identity Services API not available after loading'));
              }
            }, 2000); // Longer delay for more reliability
          }
        }, 1500); // Increased delay for initialization
      };
      script.onerror = (error) => {
        console.error('Error loading Google Identity Services:', error);
        reject(error);
      };
      document.body.appendChild(script);
    }
  });
};

// Load the Google API client library
export const loadGapiClient = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (window.gapi && window.gapi.client) {
      console.log('Google API client already loaded and initialized');
      resolve();
      return;
    }
    
    if (document.getElementById('google-gapi-script')) {
      console.log('Google API client script tag exists, but client may not be initialized');
      
      // Wait for a short period to see if it initializes
      setTimeout(() => {
        if (window.gapi && window.gapi.client) {
          console.log('Google API client initialized after waiting');
          resolve();
        } else {
          console.log('Google API client still not available, removing script tag and reloading');
          // Remove the existing script tag to force a clean reload
          const existingScript = document.getElementById('google-gapi-script');
          if (existingScript && existingScript.parentNode) {
            existingScript.parentNode.removeChild(existingScript);
          }
          loadScript();
        }
      }, 1000);
      return;
    }
    
    loadScript();
    
    function loadScript() {
      const script = document.createElement('script');
      script.id = 'google-gapi-script';
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize the gapi.client with a delay to ensure proper loading
        setTimeout(() => {
          if (!window.gapi) {
            console.error('GAPI not available after script load');
            reject(new Error('Google API client not available after loading'));
            return;
          }
          
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
        }, 1500); // Add longer delay for more reliable initialization
      };
      script.onerror = (error) => {
        console.error('Error loading Google API client:', error);
        reject(error);
      };
      document.body.appendChild(script);
    }
  });
};
