
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthState } from './youtube/types';
import { loadGapiClient, loadGisClient } from './youtube/api-loaders';
import { fetchUserProfile } from './youtube/user-profile';
import { storeYouTubeUser } from './youtube/user-storage';
import { 
  CLIENT_ID, 
  REDIRECT_URI, 
  SCOPES, 
  initialAuthState, 
  areCredentialsConfigured,
  checkTokenValidity
} from './youtube/config';

const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const TOKEN_KEY = 'youtube_access_token';
const USER_KEY = 'youtube_user';
const TOKEN_TIMESTAMP_KEY = 'youtube_token_timestamp';

export const useYouTubeAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [credentialsConfigured] = useState(areCredentialsConfigured());
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const isTokenStale = () => {
    const timestamp = sessionStorage.getItem(TOKEN_TIMESTAMP_KEY);
    if (!timestamp) return true;
    
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const elapsedTime = now - tokenTime;
    
    console.log(`Token age check: ${elapsedTime / 1000}s elapsed (threshold: ${TOKEN_REFRESH_THRESHOLD_MS / 1000}s)`);
    
    return elapsedTime > TOKEN_REFRESH_THRESHOLD_MS;
  };

  useEffect(() => {
    const initClients = async () => {
      try {
        setIsInitializing(true);
        
        if (!credentialsConfigured) {
          console.warn('YouTube API credentials not configured');
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
                console.log("Token received from Google OAuth", tokenResponse.access_token.substring(0, 10) + "...");
                
                sessionStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
                
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
        
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);
        
        console.log("Checking for saved credentials:", !!savedToken, !!savedUser);
        
        if (savedToken && savedUser) {
          try {
            if (isTokenStale()) {
              console.warn("Saved token is too old, clearing session");
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
              
              toast({
                title: "Session Expired",
                description: "Your YouTube session has expired. Please sign in again.",
                variant: "default",
              });
              return;
            }
            
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
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
              
              toast({
                title: "Session Expired",
                description: "Your YouTube session has expired. Please sign in again.",
                variant: "default",
              });
            }
          } catch (err) {
            console.error("Failed to parse saved credentials:", err);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
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
      // Cleanup if needed
    };
  }, [credentialsConfigured, toast]);

  const handleAuthSuccess = async (accessToken: string) => {
    console.log('Authentication successful, token received');
    
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
      
      localStorage.setItem(TOKEN_KEY, accessToken);
      sessionStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
      console.log("Saved token to localStorage and timestamp to sessionStorage");
      
      toast({
        title: "Successfully authenticated",
        description: "Fetching your profile information...",
        variant: "default",
      });
      
      let user = null;
      let retries = 3;
      let lastError = null;
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Attempting to fetch user profile, attempt ${attempt}/${retries}`);
          
          if (attempt > 1) {
            const delay = attempt * 2000;
            console.log(`Waiting ${delay}ms before retry ${attempt}`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          user = await fetchUserProfile(accessToken);
          console.log("User profile retrieved on attempt", attempt, user);
          
          if (user) {
            await storeYouTubeUser({
              youtube_user_id: user.id || `youtube_${Date.now()}`,
              name: user.name,
              email: user.email,
              picture: user.picture,
              access_token: accessToken
            });
          }
          
          break;
        } catch (err) {
          lastError = err;
          console.warn(`User profile fetch attempt ${attempt} failed:`, err);
          
          if (err instanceof Error && 
              (err.message.includes('Token rejected') || 
               err.message.includes('Invalid or expired access token'))) {
            console.error('Token was explicitly rejected by Google API, not retrying');
            break;
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
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        toast({
          title: "Successfully connected",
          description: `Welcome, ${user.name}! Your YouTube account is now connected.`,
          variant: "default",
        });
        
        setProfileFetchError(null);
      } else {
        console.error("Failed to fetch user profile after multiple attempts", lastError);
        let errorMessage = "Failed to fetch user profile.";
        
        if (lastError instanceof Error) {
          errorMessage = lastError.message;
        }
        
        console.error('Profile fetch error:', errorMessage);
        setProfileFetchError(errorMessage);
        
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
        
        setAuthState(initialAuthState);
        
        toast({
          title: "Profile Information Unavailable",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      setError(null);
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
      
      setAuthState(initialAuthState);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
      
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
      
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
      setProfileFetchError(null);
      
      console.log('Current origin:', window.location.origin);
      console.log('Current path:', window.location.pathname);
      console.log('Initiating OAuth flow with prompt=consent for /mock-dashboard');
      
      tokenClient.requestAccessToken({
        prompt: 'consent',
        hint: '',
        state: window.location.pathname,
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
      const token = localStorage.getItem(TOKEN_KEY);
      
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
      
      if (token) {
        try {
          console.log('Revoking token with Google OAuth server');
          const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${token}`;
          await fetch(revokeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          console.log('Token revoked successfully');
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
