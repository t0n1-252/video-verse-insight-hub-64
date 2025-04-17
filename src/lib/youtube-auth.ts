
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
  areCredentialsConfigured 
} from './youtube/config';

// Hook for YouTube authentication
export const useYouTubeAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [credentialsConfigured] = useState(areCredentialsConfigured());
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);
  
  // Fix for React Hook order error: bring toast initialization to top level
  const { toast } = useToast();

  // Initialize Google API clients
  useEffect(() => {
    const initClients = async () => {
      try {
        setIsInitializing(true);
        
        if (!credentialsConfigured) {
          console.warn('YouTube API credentials not configured. Please set up your API keys in src/lib/youtube-auth.ts');
          setIsInitializing(false);
          return;
        }
        
        // Load both clients in parallel
        await Promise.all([loadGapiClient(), loadGisClient()]);
        console.log("Successfully loaded both API clients");
        
        // Initialize the token client
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES.join(' '),
            redirect_uri: REDIRECT_URI, // Explicitly set the redirect URI
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
              
              // Show toast for error
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
        
        // Check if user is already signed in (via localStorage)
        const savedToken = localStorage.getItem('youtube_access_token');
        const savedUser = localStorage.getItem('youtube_user');
        
        console.log("Checking for saved credentials:", !!savedToken, !!savedUser);
        
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
              console.log("Restored token to GAPI client");
            }
            
            // Verify the token is still valid by attempting to fetch user profile
            fetchUserProfile(savedToken)
              .then(profile => {
                console.log("Verified saved token is valid");
              })
              .catch(err => {
                // If profile fetch fails, token is likely expired - sign out
                console.log('Saved token appears to be invalid - clearing auth state', err);
                localStorage.removeItem('youtube_access_token');
                localStorage.removeItem('youtube_user');
                setAuthState(initialAuthState);
                
                toast({
                  title: "Session Expired",
                  description: "Your YouTube session has expired. Please sign in again.",
                  variant: "default",
                });
              });
          } catch (err) {
            // Invalid stored data, clear it
            console.error("Failed to parse saved credentials:", err);
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

  // Helper function to handle successful authentication
  const handleAuthSuccess = async (accessToken: string) => {
    console.log('Authentication successful, token obtained');
    
    try {
      // Set the token for Google API calls
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken({ access_token: accessToken });
        console.log("Set token in GAPI client");
      }
      
      // Update authentication state immediately to improve user experience
      setAuthState(prevState => ({
        ...prevState,
        isSignedIn: true,
        accessToken
      }));
      
      // Store token in localStorage
      localStorage.setItem('youtube_access_token', accessToken);
      console.log("Saved token to localStorage");
      
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
          console.log("User profile retrieved:", user);
          break;
        } catch (err) {
          lastError = err;
          console.warn(`User profile fetch attempt failed, ${retries - 1} retries left`, err);
          retries--;
          
          if (retries > 0) {
            // Increase delay between retries
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
          }
        }
      }
      
      if (user) {
        console.log('User profile successfully fetched and processed');
        // Update auth state with user profile
        setAuthState(prevState => ({
          ...prevState,
          isSignedIn: true,
          accessToken,
          user
        }));
        
        // Store in localStorage for persistence
        localStorage.setItem('youtube_user', JSON.stringify(user));
        
        toast({
          title: "Successfully connected",
          description: `Welcome, ${user.name}! Your YouTube account is now connected.`,
          variant: "default",
        });
        
        // Clear any profile fetch error
        setProfileFetchError(null);
      } else {
        // Handle the case where we couldn't get the profile
        console.error("Failed to fetch user profile after multiple attempts", lastError);
        let errorMessage = "Failed to fetch user profile."; // Default error message

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

        // Clear the auth state as the token may be invalid
        setAuthState(initialAuthState);
        localStorage.removeItem('youtube_access_token');
        localStorage.removeItem('youtube_user');

        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Don't continue with the fallback user approach - instead, force re-authentication
        return;
      }
      
      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
      
      // Clear auth state on error
      setAuthState(initialAuthState);
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_user');
      
      toast({
        title: "Authentication Failed",
        description: "An unexpected error occurred. Please try signing in again.",
        variant: "destructive",
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
      setProfileFetchError(null);
      
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
      setProfileFetchError(null);
      
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
    profileFetchError,
    signIn,
    signOut
  };
};
