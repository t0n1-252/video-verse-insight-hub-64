
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthState } from '../types';
import { CLIENT_ID, areCredentialsConfigured } from '../config';
import { YouTubeAuthManager } from '../auth/auth-manager';
import { clearSession, getStoredSession, isTokenStale } from '../auth/session';
import { YouTubeAuthHookResult } from '../auth/types';
import { loadGisClient } from '../api-loaders';

export const useYouTubeAuth = (): YouTubeAuthHookResult => {
  const [authState, setAuthState] = useState<AuthState>({ isSignedIn: false, accessToken: null, user: null });
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [credentialsConfigured] = useState(areCredentialsConfigured());
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);
  
  const toast = useToast();
  const authManager = new YouTubeAuthManager(toast);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!credentialsConfigured) {
          setIsInitializing(false);
          return;
        }

        const session = getStoredSession();
        if (session.accessToken && !isTokenStale(session.timestamp)) {
          const user = localStorage.getItem('youtube_user');
          if (user) {
            setAuthState({
              isSignedIn: true,
              accessToken: session.accessToken,
              user: JSON.parse(user)
            });
          }
        }

        // Explicitly load GIS client first
        try {
          console.log('Loading Google Identity Services client...');
          await loadGisClient();
          console.log('Google Identity Services client loaded successfully');
        } catch (e) {
          console.error('Failed to load Google Identity Services:', e);
          throw new Error('Failed to load authentication services. Please try again.');
        }

        // Now initialize the token client
        if (window.google?.accounts?.oauth2) {
          console.log('Initializing token client...');
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube',
            callback: async (response: any) => {
              if (response?.access_token) {
                try {
                  const newAuthState = await authManager.handleAuthSuccess(response.access_token);
                  setAuthState(newAuthState);
                  setProfileFetchError(null);
                } catch (err) {
                  handleAuthError(err);
                }
              }
            },
            error_callback: (error: any) => handleAuthError(error)
          });
          console.log('Token client initialized successfully');
          setTokenClient(client);
        } else {
          console.error('Google Identity Services not available after loading');
          throw new Error('Authentication services not available. Please refresh the page and try again.');
        }
      } catch (err) {
        handleAuthError(err);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [credentialsConfigured]);

  const handleAuthError = (err: any) => {
    console.error('Auth error:', err);
    setError(err instanceof Error ? err : new Error(String(err)));
    setProfileFetchError(err instanceof Error ? err.message : String(err));
    setAuthState({ isSignedIn: false, accessToken: null, user: null });
    clearSession();
  };

  const signIn = async () => {
    try {
      if (!credentialsConfigured) {
        throw new Error('YouTube API credentials not configured');
      }
      
      // If token client isn't initialized, try to initialize it
      if (!tokenClient) {
        console.log('Token client not initialized, attempting to initialize...');
        
        try {
          await loadGisClient();
          
          if (!window.google?.accounts?.oauth2) {
            throw new Error('Google Identity Services not available. Please refresh the page.');
          }
          
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube',
            callback: async (response: any) => {
              if (response?.access_token) {
                try {
                  const newAuthState = await authManager.handleAuthSuccess(response.access_token);
                  setAuthState(newAuthState);
                  setProfileFetchError(null);
                } catch (err) {
                  handleAuthError(err);
                }
              }
            },
            error_callback: (error: any) => handleAuthError(error)
          });
          
          setTokenClient(client);
          console.log('Token client initialized during sign-in');
        } catch (e) {
          console.error('Failed to initialize token client during sign-in:', e);
          throw new Error('Failed to initialize authentication client. Please refresh the page and try again.');
        }
      }
      
      // Double-check that token client is now available
      if (!tokenClient && !window.google?.accounts?.oauth2) {
        throw new Error('Authentication services not available. Please refresh the page and try again.');
      }

      clearSession();
      setProfileFetchError(null);
      
      if (tokenClient) {
        console.log('Requesting access token with token client');
        tokenClient.requestAccessToken({
          prompt: 'consent',
          enable_serial_consent: true
        });
      } else {
        // Fallback method if tokenClient is still not available but google.accounts.oauth2 is
        console.log('Using fallback authentication method');
        window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube',
          callback: async (response: any) => {
            if (response?.access_token) {
              try {
                const newAuthState = await authManager.handleAuthSuccess(response.access_token);
                setAuthState(newAuthState);
                setProfileFetchError(null);
              } catch (err) {
                handleAuthError(err);
              }
            }
          },
          error_callback: (error: any) => handleAuthError(error)
        }).requestAccessToken({
          prompt: 'consent',
          enable_serial_consent: true
        });
      }
      
      return true;
    } catch (err) {
      handleAuthError(err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('youtube_access_token');
      
      clearSession();
      setAuthState({ isSignedIn: false, accessToken: null, user: null });
      setProfileFetchError(null);
      
      if (window.gapi?.client) {
        window.gapi.client.setToken(null);
      }

      if (token) {
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
        } catch (e) {
          console.error('Error revoking token:', e);
        }
      }

      toast.toast({
        title: "Signed Out",
        description: "You've been successfully signed out of your YouTube account.",
        variant: "default",
      });
      
      setError(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  return {
    ...authState,
    isInitializing,
    error,
    credentialsConfigured,
    profileFetchError,
    signIn,
    signOut
  };
};
