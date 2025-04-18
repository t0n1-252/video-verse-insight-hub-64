
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthState } from '../types';
import { CLIENT_ID, areCredentialsConfigured } from '../config';
import { YouTubeAuthManager } from '../auth/auth-manager';
import { clearSession, getStoredSession, isTokenStale } from '../auth/session';
import { YouTubeAuthHookResult } from '../auth/types';

export const useYouTubeAuth = (): YouTubeAuthHookResult => {
  const [authState, setAuthState] = useState<AuthState>({ isSignedIn: false, accessToken: null, user: null });
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [credentialsConfigured] = useState(areCredentialsConfigured());
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const authManager = new YouTubeAuthManager(toast);

  useEffect(() => {
    const initClients = async () => {
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

        if (window.google?.accounts?.oauth2) {
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
        }
      } catch (err) {
        handleAuthError(err);
      } finally {
        setIsInitializing(false);
      }
    };

    initClients();
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
      if (!tokenClient) {
        throw new Error('Token client not initialized');
      }

      clearSession();
      setProfileFetchError(null);
      
      tokenClient.requestAccessToken({
        prompt: 'consent',
        enable_serial_consent: true
      });
      
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

      toast({
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
