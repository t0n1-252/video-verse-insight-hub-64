
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// YouTube API OAuth 2.0 credentials
const API_KEY = ''; // Keep as empty string
const CLIENT_ID = '474426272719-dvcb1cbcdbc152eaaugavjs7bc87hkfk.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
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
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      console.log('Google Identity Services loaded successfully');
      resolve();
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
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
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
  const [credentialsConfigured, setCredentialsConfigured] = useState(areCredentialsConfigured());
  const [tokenClient, setTokenClient] = useState<any>(null);
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
            callback: (tokenResponse: any) => {
              if (tokenResponse && tokenResponse.access_token) {
                handleAuthSuccess(tokenResponse.access_token);
              }
            },
            error_callback: (error: any) => {
              console.error('Token client error:', error);
              setError(new Error(error.toString()));
              setIsInitializing(false);
            }
          });
          
          setTokenClient(client);
        } else {
          throw new Error('Google Identity Services not available');
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
  }, [toast]);

  // Helper function to handle successful authentication
  const handleAuthSuccess = async (accessToken: string) => {
    try {
      // Get user info using Google API
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken({ access_token: accessToken });
        
        // Fetch user profile
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await response.json();
        
        const user = {
          name: userData.name || 'YouTube User',
          email: userData.email || '',
          picture: userData.picture || ''
        };
        
        // Save authentication state
        setAuthState({
          isSignedIn: true,
          accessToken,
          user
        });
        
        // Store in localStorage for persistence
        localStorage.setItem('youtube_access_token', accessToken);
        localStorage.setItem('youtube_user', JSON.stringify(user));
        
        toast({
          title: "Successfully connected",
          description: `Welcome, ${user.name}! Your YouTube account is now connected.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      // Still set the token even if we couldn't get user details
      setAuthState({
        isSignedIn: true,
        accessToken,
        user: null
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
        throw new Error('Token client not initialized');
      }
      
      // Request an access token
      tokenClient.requestAccessToken({
        prompt: 'consent'
      });
      
      return true;
    } catch (err) {
      console.error('Error signing in:', err);
      const error = err as Error;
      setError(error);
      
      // Show more specific toast for common errors
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('invalid_client')) {
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
        } else if (error.message.includes('popup_closed_by_user')) {
          toast({
            title: "Authentication Cancelled",
            description: "You closed the login popup before completing authentication.",
            variant: "default",
          });
        } else {
          toast({
            title: "Authentication Error",
            description: error.message || "An error occurred during YouTube authentication.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Authentication Error",
          description: "An error occurred during YouTube authentication. Check the console for details.",
          variant: "destructive",
        });
      }
      
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
        // This is an additional step to properly revoke the token on Google's end
        const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${authState.accessToken}`;
        await fetch(revokeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
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
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => any;
        };
      };
    };
  }
}
