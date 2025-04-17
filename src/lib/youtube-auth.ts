
import { useEffect, useState } from 'react';

// YouTube API OAuth 2.0 credentials
// In a production app, these would be environment variables
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key when ready
const CLIENT_ID = 'YOUR_CLIENT_ID'; // Replace with your actual client ID when ready
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

// Load the Google API client library
const loadGapiClient = async () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      // Initialize the gapi.client
      window.gapi.load('client:auth2', () => {
        window.gapi.client
          .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES.join(' '),
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
          })
          .then(() => {
            resolve();
          })
          .catch((error: any) => {
            console.error('Error initializing Google API client:', error);
            reject(error);
          });
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

  // Initialize Google API clients
  useEffect(() => {
    const initClients = async () => {
      try {
        setIsInitializing(true);
        
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
        setError(err as Error);
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
      setError(err as Error);
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
