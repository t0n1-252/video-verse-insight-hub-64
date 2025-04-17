import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthState } from './youtube/types';
import { loadGapiClient, loadGisClient } from './youtube/api-loaders';
import { fetchUserProfile } from './youtube/user-profile';
import { 
  CLIENT_ID, 
  REDIRECT_URI, 
  SCOPES, 
  initialAuthState, 
  areCredentialsConfigured,
  checkTokenValidity
} from './youtube/config';

// Hook for YouTube authentication
export const useYouTubeAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [credentialsConfigured] = useState(areCredentialsConfigured());
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const initClients = async () => {
      try {
        setIsInitializing(true);
        
        if (!credentialsConfigured) {
          console.warn('YouTube API credentials not configured. Please set up your API keys in src/lib/youtube-auth.ts');
          setIsInitializing(false);
          return;
        }
        
        await Promise.all([loadGapiClient(), loadGisClient()]);
        console.log("Successfully loaded both API clients");
        
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES.join(' '),
            redirect_uri: REDIRECT_URI,
            callback: (tokenResponse: any) => {
              if (tokenResponse && tokenResponse.access_token) {
                console.log("Token received from Google OAuth", tokenResponse.access_token.substring(0, 5) + "...");
                handleAuthSuccess(tokenResponse.access_token);
              }
            },
            error_callback: (error: any) => {
              console.error('Token client error:', error);
              setError(new Error(error.toString()));
              setIsInitializing(false);
              
              toast({
                title: "Authentication Error",
                description: "Failed to authenticate with Google. Please check the console for details.",
                variant: "destructive",
              });
            }
          });
          
          setTokenClient(client);
          console.log("Token client initialized successfully");
        } else {
          console.error('Google Identity Services not available after loading');
          setError(new Error('Google Identity Services not available'));
        }
        
        const savedToken = localStorage.getItem('youtube_access_token');
        const savedUser = localStorage.getItem('youtube_user');
        
        console.log("Checking for saved credentials:", !!savedToken, !!savedUser);
        
        if (savedToken && savedUser) {
          try {
            const userObj = JSON.parse(savedUser);
            
            console.log("Validating saved token before restoring session");
            const tokenStatus = await checkTokenValidity(savedToken);
            
            if (tokenStatus.isValid) {
              console.log("Saved token is valid, restoring session");
              setAuthState({
                isSignedIn: true,
                accessToken: savedToken,
                user: userObj
              });
              
              if (window.gapi && window.gapi.client) {
                window.gapi.client.setToken({ access_token: savedToken });
                console.log("Restored token to GAPI client");
              }
            } else {
              console.warn("Saved token is invalid, clearing session:", tokenStatus.details);
              localStorage.removeItem('youtube_access_token');
              localStorage.removeItem('youtube_user');
              
              toast({
                title: "Session Expired",
                description: "Your YouTube session has expired. Please sign in again.",
                variant: "default",
              });
            }
          } catch (err) {
            console.error("Failed to parse saved credentials:", err);
            localStorage.removeItem('youtube_access_token');
            localStorage.removeItem('youtube_user');
          }
        }
      } catch (err) {
        console.error('Error initializing auth clients:', err);
        const error = err as Error;
        setError(error);
        
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
    
    return () => {
    };
  }, [credentialsConfigured, toast]);

  const handleAuthSuccess = async (accessToken: string) => {
    console.log('Authentication successful, token obtained');
    
    try {
      console.log('Validating the new token...');
      const tokenStatus = await checkTokenValidity(accessToken);
      
      if (!tokenStatus.isValid) {
        console.error('Received invalid token from Google OAuth:', tokenStatus.details);
        throw new Error(`Invalid token: ${tokenStatus.details}`);
      }
      
      console.log('Token validated successfully:', tokenStatus.details);
      
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken({ access_token: accessToken });
        console.log("Set token in GAPI client");
      }
      
      setAuthState(prevState => ({
        ...prevState,
        isSignedIn: true,
        accessToken
      }));
      
      localStorage.setItem('youtube_access_token', accessToken);
      console.log("Saved token to localStorage");
      
      toast({
        title: "Successfully authenticated",
        description: "Fetching your profile information...",
        variant: "default",
      });
      
      let user = null;
      let retries = 3;
      let lastError = null;
      
      while (retries > 0 && !user) {
        try {
          console.log(`Attempting to fetch user profile, attempt ${4-retries}/3`);
          user = await fetchUserProfile(accessToken);
          console.log("User profile retrieved:", user);
          break;
        } catch (err) {
          lastError = err;
          console.warn(`User profile fetch attempt failed, ${retries - 1} retries left`, err);
          retries--;
          
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }
      
      if (user) {
        console.log('User profile successfully fetched and processed');
        setAuthState(prevState => ({
          ...prevState,
          isSignedIn: true,
          accessToken,
          user
        }));
        
        localStorage.setItem('youtube_user', JSON.stringify(user));
        
        toast({
          title: "Successfully connected",
          description: `Welcome, ${user.name}! Your YouTube account is now connected.`,
          variant: "default",
        });
        
        setProfileFetchError(null);
      } else {
        console.error("Failed to fetch user profile after multiple attempts", lastError);
        let errorMessage = "Failed to fetch user profile.";
        
        if (lastError && lastError.message) {
          if (lastError.message.includes("401")) {
            errorMessage = "Invalid access token. Please sign in again.";
          } else if (lastError.message.includes("500")) {
            errorMessage = "Unable to fetch your profile due to a server error. Please try again later.";
          } else if (lastError.message.includes("Failed to fetch")) {
            errorMessage = "Network error: Couldn't connect to Google servers. Please check your internet connection.";
          }
        }
        
        console.error(errorMessage);
        setProfileFetchError(errorMessage);
        
        setAuthState(initialAuthState);
        localStorage.removeItem('youtube_access_token');
        localStorage.removeItem('youtube_user');
        
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        return;
      }
      
      setError(null);
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
      
      setAuthState(initialAuthState);
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_user');
      
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try signing in again.",
        variant: "destructive",
      });
    }
  };

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
      
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_user');
      setProfileFetchError(null);
      
      console.log('Current origin:', window.location.origin);
      
      tokenClient.requestAccessToken({
        prompt: 'consent',
        hint: '',
        state: REDIRECT_URI,
        enable_serial_consent: true
      });
      
      return true;
    } catch (err) {
      console.error('Error signing in:', err);
      const error = err as Error;
      setError(error);
      
      let errorTitle = "Authentication Error";
      let errorDescription = "An error occurred during YouTube authentication. Check the console for details.";
      
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

  const signOut = async () => {
    try {
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_user');
      
      if (authState.accessToken) {
        try {
          const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${authState.accessToken}`;
          await fetch(revokeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
        } catch (e) {
          console.error('Error revoking token:', e);
        }
      }
      
      setAuthState(initialAuthState);
      setProfileFetchError(null);
      
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken(null);
      }
      
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out of your YouTube account.",
        variant: "default",
      });
      
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
    profileFetchError,
    signIn,
    signOut
  };
};
