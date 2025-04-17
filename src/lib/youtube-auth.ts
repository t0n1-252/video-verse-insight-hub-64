import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// YouTube API OAuth 2.0 credentials
const API_KEY = ''; // Keep as empty string
const CLIENT_ID = '474426272719-dvcb1cbcdbc152eaaugavjs7bc87hkfk.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
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

// Load the Google API client library
const loadGapiClient = async () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      // Initialize the gapi.client
      window.gapi.load('client:auth2', async () => {
        try {
          if (!areCredentialsConfigured()) {
            throw new Error('YouTube API credentials not configured');
          }
          
          await window.gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES.join(' '),
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
          });
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

// Load the Google Identity Services client library
const loadGisClient = async () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      resolve();
    };
    script.onerror = (error) => {
      console.error('Error loading Google Identity Services:', error);
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
        
        // Check if user is already signed in
        if (window.gapi.auth2 && 
            window.gapi.auth2.getAuthInstance() && 
            window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
          const googleUser = window.gapi.auth2.getAuthInstance().currentUser.get();
          const profile = googleUser.getBasicProfile();
          const authResponse = googleUser.getAuthResponse();
          
          setAuthState({
            isSignedIn: true,
            accessToken: authResponse.access_token,
            user: {
              name: profile.getName(),
              email: profile.getEmail(),
              picture: profile.getImageUrl()
            }
          });
        }
      } catch (err) {
        console.error('Error initializing auth clients:', err);
        const error = err as Error;
        setError(error);
        
        // Show toast notification for certain errors
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
  }, []);

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
      
      if (!window.gapi || !window.gapi.auth2) {
        throw new Error('Google API client not loaded');
      }
      
      const googleAuth = window.gapi.auth2.getAuthInstance();
      const googleUser = await googleAuth.signIn();
      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();
      
      setAuthState({
        isSignedIn: true,
        accessToken: authResponse.access_token,
        user: {
          name: profile.getName(),
          email: profile.getEmail(),
          picture: profile.getImageUrl()
        }
      });
      
      return authResponse.access_token;
    } catch (err) {
      console.error('Error signing in:', err);
      const error = err as Error;
      setError(error);
      
      // Show more specific toast for invalid client error
      if (error.message.includes('invalid_client')) {
        toast({
          title: "Authentication Error",
          description: "Your YouTube API client ID is invalid. Please check your configuration.",
          variant: "destructive",
        });
      }
      
      throw err;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      if (!window.gapi || !window.gapi.auth2) {
        throw new Error('Google API client not loaded');
      }
      
      const googleAuth = window.gapi.auth2.getAuthInstance();
      await googleAuth.signOut();
      
      setAuthState(initialAuthState);
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
          apiKey: string;
          clientId: string;
          scope: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        setApiKey: (apiKey: string) => void;
        setToken: (token: { access_token: string }) => void;
        youtube: any;
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
            listen: (callback: (isSignedIn: boolean) => void) => void;
          };
          signIn: () => Promise<any>;
          signOut: () => Promise<void>;
          currentUser: {
            get: () => {
              getBasicProfile: () => {
                getName: () => string;
                getEmail: () => string;
                getImageUrl: () => string;
              };
              getAuthResponse: () => {
                access_token: string;
                id_token: string;
                expires_at: number;
                token_type: string;
                scope: string;
              };
            };
          };
        };
      };
    };
    google: any;
  }
}
