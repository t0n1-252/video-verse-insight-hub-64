
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// YouTube API OAuth 2.0 credentials
const API_KEY = ''; // Keep as empty string
const CLIENT_ID = '474426272719-dvcb1cbcdbc152eaaugavjs7bc87hkfk.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

// Interfaces
export interface AuthState {
  isSignedIn: boolean;
  accessToken: string | null;
  user: {
    name: string;
    email: string;
    picture: string;
  } | null;
}

// Initial auth state
const initialAuthState: AuthState = {
  isSignedIn: false,
  accessToken: null,
  user: null
};

// Check if credentials are configured
const areCredentialsConfigured = () => {
  return CLIENT_ID.trim() !== '';
};

// Load the Google Identity Services client library
const loadGisClient = async () => {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById('google-gis-script')) {
      console.log('Google Identity Services already loaded');
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded successfully');
      // Add a small delay to ensure the script is fully initialized
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          resolve();
        } else {
          console.warn('Google Identity Services loaded but not available yet, retrying...');
          // Try again in 100ms
          setTimeout(() => {
            if (window.google && window.google.accounts) {
              resolve();
            } else {
              reject(new Error('Google Identity Services not available after loading'));
            }
          }, 100);
        }
      }, 50);
    };
    script.onerror = (error) => {
      console.error('Error loading Google Identity Services:', error);
      reject(error);
    };
    document.body.appendChild(script);
  });
};

// Load the Google API client library
const loadGapiClient = async () => {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById('google-gapi-script')) {
      console.log('Google API client already loaded');
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-gapi-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize the gapi.client
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
    };
    script.onerror = (error) => {
      console.error('Error loading Google API client:', error);
      reject(error);
    };
    document.body.appendChild(script);
  });
};

// Hook for YouTube authentication
export const useYouTubeAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [credentialsConfigured] = useState(areCredentialsConfigured());
  const [tokenClient, setTokenClient] = useState<any>(null);
  
  // Fix for React Hook order error: bring toast initialization to top level
  const { toast } = useToast();

  // Initialize Google API clients
  useEffect(() => {
    const initClients = async () => {
      try {
        setIsInitializing(true);
        
        if (!credentialsConfigured) {
          console.warn('YouTube API credentials not configured. Please set up your API keys in src/lib/youtube-auth.ts');
          setError(new Error('YouTube API credentials not configured'));
          return;
        }
        
        // Load both clients in parallel
        await Promise.all([loadGapiClient(), loadGisClient()]);
        
        // Initialize the token client
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES.join(' '),
            redirect_uri: REDIRECT_URI, // Explicitly set the redirect URI
            callback: (tokenResponse: any) => {
              if (tokenResponse && tokenResponse.access_token) {
                handleAuthSuccess(tokenResponse.access_token);
              }
            },
            error_callback: (error: any) => {
              console.error('Token client error:', error);
              setError(new Error(error.toString()));
              setIsInitializing(false);
              
              // Show toast for error
              toast({
                title: "Authentication Error",
                description: "Failed to authenticate with Google. Please check the console for details.",
                variant: "destructive",
              });
            }
          });
          
          setTokenClient(client);
        } else {
          console.error('Google Identity Services not available after loading');
          setError(new Error('Google Identity Services not available'));
        }
        
        // Check if user is already signed in (via localStorage)
        const savedToken = localStorage.getItem('youtube_access_token');
        const savedUser = localStorage.getItem('youtube_user');
        
        if (savedToken && savedUser) {
          try {
            const userObj = JSON.parse(savedUser);
            setAuthState({
              isSignedIn: true,
              accessToken: savedToken,
              user: userObj
            });
            
            // Set token for API calls
            if (window.gapi && window.gapi.client) {
              window.gapi.client.setToken({ access_token: savedToken });
            }
            
            // Verify the token is still valid by attempting to fetch user profile
            fetchUserProfile(savedToken).catch(() => {
              // If profile fetch fails, token is likely expired - sign out
              console.log('Saved token appears to be invalid - clearing auth state');
              localStorage.removeItem('youtube_access_token');
              localStorage.removeItem('youtube_user');
              setAuthState(initialAuthState);
            });
          } catch (err) {
            // Invalid stored data, clear it
            localStorage.removeItem('youtube_access_token');
            localStorage.removeItem('youtube_user');
          }
        }
      } catch (err) {
        console.error('Error initializing auth clients:', err);
        const error = err as Error;
        setError(error);
        
        // Show toast notification for certain errors
        if (error.message && typeof error.message === 'string') {
          if (error.message.includes('credentials not configured')) {
            toast({
              title: "YouTube API Setup Required",
              description: "Please configure your YouTube API credentials. Visit the /setup page for instructions.",
              variant: "destructive",
            });
          } else if (error.message.includes('invalid_client')) {
            toast({
              title: "Authentication Error",
              description: "Your YouTube API client ID is invalid. Please check your configuration.",
              variant: "destructive",
            });
          } else if (error.message.includes('redirect_uri_mismatch') || error.message.includes('JavaScript origin')) {
            toast({
              title: "Authorization Error",
              description: "Redirect URI or JavaScript origin mismatch. Make sure they're correctly configured in Google Cloud Console.",
              variant: "destructive",
            });
          }
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initClients();
    
    // Cleanup function
    return () => {
      // Nothing to clean up for now
    };
  }, [credentialsConfigured, toast]);

  // Helper function to fetch user profile - improved error handling and debugging
  const fetchUserProfile = async (accessToken: string) => {
    if (!accessToken) {
      console.error('No access token provided for fetchUserProfile');
      throw new Error('Missing access token');
    }
    
    console.log(`Attempting to fetch user profile with token length: ${accessToken.length}`);
    
    // Use a simple GET request with the Google userinfo endpoint
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://www.googleapis.com/oauth2/v3/userinfo', true);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const userData = JSON.parse(xhr.responseText);
            console.log('User profile data retrieved successfully', {
              name: userData.name ? 'present' : 'missing',
              email: userData.email ? 'present' : 'missing',
              picture: userData.picture ? 'present' : 'missing'
            });
            
            resolve({
              name: userData.name || 'YouTube User',
              email: userData.email || '',
              picture: userData.picture || ''
            });
          } catch (error) {
            console.error('Error parsing user profile JSON:', error);
            reject(new Error('Failed to parse user profile data'));
          }
        } else {
          console.error(`User profile fetch failed with status: ${xhr.status}`);
          console.error(`Response text: ${xhr.responseText.substring(0, 200)}...`);
          reject(new Error(`Failed to fetch user profile: ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        console.error('Network error while fetching user profile');
        reject(new Error('Network error while fetching user profile'));
      };
      
      xhr.ontimeout = function() {
        console.error('Timeout while fetching user profile');
        reject(new Error('Request timed out'));
      };
      
      // Set a longer timeout
      xhr.timeout = 10000; // 10 seconds
      
      xhr.send();
    });
  };

  // Helper function to handle successful authentication
  const handleAuthSuccess = async (accessToken: string) => {
    console.log('Authentication successful, token obtained');
    
    try {
      // Set the token for Google API calls
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken({ access_token: accessToken });
      }
      
      // Update authentication state immediately to improve user experience
      setAuthState({
        isSignedIn: true,
        accessToken,
        user: null // Will be updated after profile fetch
      });
      
      // Store token in localStorage
      localStorage.setItem('youtube_access_token', accessToken);
      
      // Notify user that authentication was successful
      toast({
        title: "Successfully authenticated",
        description: "Fetching your profile information...",
        variant: "default",
      });
      
      // Try to fetch user profile with multiple retries
      let user = null;
      let retries = 3;
      let lastError = null;
      
      while (retries > 0 && !user) {
        try {
          console.log(`Attempting to fetch user profile, attempt ${4-retries}/3`);
          user = await fetchUserProfile(accessToken);
          break;
        } catch (err) {
          lastError = err;
          console.warn(`User profile fetch attempt failed, ${retries - 1} retries left`, err);
          retries--;
          
          if (retries > 0) {
            // Increase delay between retries
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      if (user) {
        console.log('User profile successfully fetched and processed');
        // Update auth state with user profile
        setAuthState({
          isSignedIn: true,
          accessToken,
          user
        });
        
        // Store in localStorage for persistence
        localStorage.setItem('youtube_user', JSON.stringify(user));
        
        toast({
          title: "Successfully connected",
          description: `Welcome, ${user.name}! Your YouTube account is now connected.`,
          variant: "default",
        });
      } else {
        // Still logged in but couldn't get profile
        console.error('Failed to fetch user profile after multiple attempts', lastError);
        
        // Set basic user info without profile details
        setAuthState({
          isSignedIn: true,
          accessToken,
          user: {
            name: 'YouTube User',
            email: '',
            picture: ''
          }
        });
        
        toast({
          title: "Connected with limited info",
          description: "Your YouTube account is connected, but we couldn't fetch your profile details. You can still use the app.",
          variant: "default",
        });
      }
      
      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
      
      // We're still authenticated, just couldn't get user details
      setAuthState({
        isSignedIn: true,
        accessToken,
        user: {
          name: 'YouTube User',
          email: '',
          picture: ''
        }
      });
      
      toast({
        title: "Partially connected",
        description: "Your YouTube account is connected, but we couldn't fetch your profile details. You can still use the app.",
        variant: "default",
      });
    }
  };

  // Sign in function
  const signIn = async () => {
    try {
      if (!credentialsConfigured) {
        const error = new Error('YouTube API credentials not configured');
        toast({
          title: "YouTube API Setup Required",
          description: "Please configure your YouTube API credentials. Visit the /setup page for instructions.",
          variant: "destructive",
        });
        throw error;
      }
      
      if (!tokenClient) {
        const error = new Error('Token client not initialized');
        toast({
          title: "Not Ready",
          description: "Authentication system is still initializing. Please wait a moment and try again.",
          variant: "destructive",
        });
        throw error;
      }
      
      // Clear previous auth state to prevent conflicts
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_user');
      
      // Log the current origin for debugging
      console.log('Current origin:', window.location.origin);
      
      // Request an access token with explicit handling for redirect URI issues
      tokenClient.requestAccessToken({
        prompt: 'consent',
        hint: '',
        state: REDIRECT_URI, // Pass state parameter for additional security
        enable_serial_consent: true
      });
      
      return true;
    } catch (err) {
      console.error('Error signing in:', err);
      const error = err as Error;
      setError(error);
      
      // Default error message
      let errorTitle = "Authentication Error";
      let errorDescription = "An error occurred during YouTube authentication. Check the console for details.";
      
      // Show more specific toast for common errors
      if (error && error.message && typeof error.message === 'string') {
        if (error.message.includes('invalid_client')) {
          errorDescription = "Your YouTube API client ID is invalid. Please check your configuration.";
        } else if (error.message.includes('redirect_uri_mismatch')) {
          errorTitle = "Redirect URI Mismatch";
          errorDescription = `Please add "${window.location.origin}" to the authorized redirect URIs in your Google Cloud Console.`;
        } else if (error.message.includes('JavaScript origin')) {
          errorTitle = "JavaScript Origin Mismatch";
          errorDescription = `Please add "${window.location.origin}" to the authorized JavaScript origins in your Google Cloud Console.`;
        } else if (error.message.includes('popup_closed_by_user')) {
          errorTitle = "Authentication Cancelled";
          errorDescription = "You closed the login popup before completing authentication.";
        } else {
          errorDescription = error.message || errorDescription;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      
      throw err;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_user');
      
      // Revoke token if possible
      if (authState.accessToken) {
        try {
          // This is an additional step to properly revoke the token on Google's end
          const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${authState.accessToken}`;
          await fetch(revokeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
        } catch (e) {
          console.error('Error revoking token:', e);
          // Continue with sign out even if token revocation fails
        }
      }
      
      // Reset state
      setAuthState(initialAuthState);
      
      // Clear token from gapi if available
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken(null);
      }
      
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out of your YouTube account.",
        variant: "default",
      });
      
      // Clear errors
      setError(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err as Error);
      throw err;
    }
  };

  return {
    ...authState,
    isInitializing,
    error,
    credentialsConfigured,
    signIn,
    signOut
  };
};

// Add global type declarations for the Google API client
declare global {
  interface Window {
    gapi: {
      load: (
        apiName: string,
        callback: () => void
      ) => void;
      client: {
        init: (config: {
          apiKey?: string;
          clientId?: string;
          scope?: string;
          discoveryDocs?: string[];
        }) => Promise<void>;
        setToken: (token: { access_token: string } | null) => void;
        setApiKey: (apiKey: string) => void;
        youtube: any;
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            redirect_uri?: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => any;
        };
      };
    };
  }
}
