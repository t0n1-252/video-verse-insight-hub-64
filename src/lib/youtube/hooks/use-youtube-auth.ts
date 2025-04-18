
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthState } from '../types';
import { CLIENT_ID, SCOPES, areCredentialsConfigured } from '../config';
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
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  
  const toast = useToast();
  const authManager = new YouTubeAuthManager(toast);
  const authInProgress = useRef(false);

  // Load Google Identity Services script
  useEffect(() => {
    if (!credentialsConfigured) {
      setIsInitializing(false);
      return;
    }

    const loadGoogleScript = () => {
      // Check if script is already loaded
      if (document.getElementById('google-gsi-script')) {
        if (window.google?.accounts?.oauth2) {
          console.log('Google Identity Services already loaded');
          setGoogleScriptLoaded(true);
          return;
        }
        // Remove existing script if it failed to initialize properly
        const existingScript = document.getElementById('google-gsi-script');
        if (existingScript) existingScript.remove();
      }

      // Create and load the script
      console.log('Loading Google Identity Services script...');
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Identity Services script loaded');
        // Give it time to initialize
        setTimeout(() => {
          if (window.google?.accounts?.oauth2) {
            console.log('Google Identity Services initialized');
            setGoogleScriptLoaded(true);
          } else {
            console.error('Google Identity Services not initialized after loading');
            setProfileFetchError('Authentication service failed to initialize');
          }
        }, 1000);
      };
      
      script.onerror = (e) => {
        console.error('Failed to load Google Identity Services script', e);
        setProfileFetchError('Failed to load authentication service');
        setIsInitializing(false);
      };
      
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, [credentialsConfigured]);

  // Initialize token client when Google script is loaded
  useEffect(() => {
    if (!googleScriptLoaded || !window.google?.accounts?.oauth2 || tokenClient) {
      return;
    }

    console.log('Initializing token client...');
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES.join(' '),
        callback: async (response: any) => {
          if (response?.access_token) {
            try {
              setAuthState({ isSignedIn: false, accessToken: null, user: null });
              const newAuthState = await authManager.handleAuthSuccess(response.access_token);
              setAuthState(newAuthState);
              setProfileFetchError(null);
            } catch (err) {
              handleAuthError(err);
            } finally {
              authInProgress.current = false;
            }
          }
        },
        error_callback: (error: any) => {
          authInProgress.current = false;
          handleAuthError(error);
        }
      });
      
      setTokenClient(client);
      console.log('Token client initialized successfully');
    } catch (err) {
      console.error('Failed to initialize token client:', err);
      setProfileFetchError('Failed to initialize authentication client');
      setIsInitializing(false);
    }
  }, [googleScriptLoaded]);

  // Check for existing session
  useEffect(() => {
    if (!googleScriptLoaded) return;
    
    try {
      const session = getStoredSession();
      if (session.accessToken && !isTokenStale(session.timestamp)) {
        const userData = localStorage.getItem('youtube_user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setAuthState({
              isSignedIn: true,
              accessToken: session.accessToken,
              user: parsedUser
            });
          } catch (e) {
            console.error('Failed to parse stored user data:', e);
            clearSession();
          }
        }
      }
    } catch (err) {
      console.error('Error checking session:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [googleScriptLoaded]);

  const handleAuthError = useCallback((err: any) => {
    console.error('Auth error:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    setError(err instanceof Error ? err : new Error(errorMessage));
    setProfileFetchError(errorMessage);
    setAuthState({ isSignedIn: false, accessToken: null, user: null });
    clearSession();
    
    // Show error toast for better UX
    toast.toast({
      title: "Authentication Failed",
      description: errorMessage.substring(0, 100), // Limit length
      variant: "destructive",
    });
  }, [toast]);

  const signIn = useCallback(async () => {
    try {
      if (authInProgress.current) {
        console.log('Auth already in progress, ignoring request');
        return false;
      }
      
      if (!credentialsConfigured) {
        throw new Error('YouTube API credentials not configured');
      }
      
      if (!tokenClient) {
        throw new Error('Authentication client not initialized. Please refresh the page and try again.');
      }

      authInProgress.current = true;
      clearSession();
      setProfileFetchError(null);
      
      console.log('Requesting access token with token client');
      tokenClient.requestAccessToken({
        prompt: 'consent',
        // Add more specific hints for better UX
        hint: localStorage.getItem('youtube_email') || '',
        enable_serial_consent: true
      });
      
      return true;
    } catch (err) {
      authInProgress.current = false;
      handleAuthError(err);
      throw err;
    }
  }, [credentialsConfigured, tokenClient, handleAuthError]);

  const signOut = useCallback(async () => {
    try {
      const token = localStorage.getItem('youtube_access_token');
      
      clearSession();
      setAuthState({ isSignedIn: false, accessToken: null, user: null });
      setProfileFetchError(null);
      
      if (window.gapi?.client) {
        window.gapi.client.setToken(null);
      }
      
      if (window.google?.accounts) {
        window.google.accounts.oauth2.revoke(token || '', () => {
          console.log('Token revoked successfully');
        });
      }

      // Additionally try server-side revocation
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
      return true;
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [toast]);

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
