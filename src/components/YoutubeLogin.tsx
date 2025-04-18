
import { useYouTubeAuth } from '@/lib/youtube-auth';
import { useState, useEffect } from 'react';
import LoadingState from './youtube/LoadingState';
import CredentialsError from './youtube/CredentialsError';
import AuthError from './youtube/AuthError';
import UserProfile from './youtube/UserProfile';
import SignInForm from './youtube/SignInForm';
import { clearSession } from '@/lib/youtube/auth/session';

interface YoutubeLoginProps {
  onLoginSuccess?: () => void;
}

const YoutubeLogin = ({ onLoginSuccess }: YoutubeLoginProps) => {
  const { 
    isSignedIn, 
    isInitializing, 
    user, 
    credentialsConfigured, 
    profileFetchError, 
    signIn, 
    signOut 
  } = useYouTubeAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // If login is successful, call the callback
  useEffect(() => {
    if (isSignedIn && user && onLoginSuccess) {
      console.log("Login successful, calling onLoginSuccess callback");
      onLoginSuccess();
    }
  }, [isSignedIn, user, onLoginSuccess]);

  // Reset signing in state if auth state changes
  useEffect(() => {
    if (isSignedIn || profileFetchError) {
      setSigningIn(false);
    }
  }, [isSignedIn, profileFetchError]);

  // Initialize authError from profile fetch error
  useEffect(() => {
    if (profileFetchError && !authError) {
      setAuthError(profileFetchError);
    }
  }, [profileFetchError, authError]);

  const handleAuth = async () => {
    if (isSignedIn) {
      console.log("Signing out");
      try {
        await signOut();
        // Force clear after signout
        clearSession();
      } catch (error) {
        console.error("Sign out error:", error);
        // Even if sign out fails, clear the session
        clearSession();
      }
    } else {
      try {
        console.log("Attempting to sign in");
        setAuthError(null);
        setSigningIn(true);
        
        // Ensure we have a clean state before signing in
        clearSession();
        
        await signIn();
        console.log("Sign in process initiated successfully");
      } catch (error) {
        console.error("Authentication error:", error);
        if (error instanceof Error) {
          setAuthError(error.message);
        } else {
          setAuthError("Unknown authentication error occurred");
        }
        setSigningIn(false);
      }
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setAuthError(null);
    
    if (retryCount >= 1) { // Reduce the retry count before clearing
      // After multiple retries, try a more thorough reset
      handleClearAndRetry();
    } else {
      handleAuth();
    }
  };

  const handleClearAndRetry = () => {
    console.log("Performing thorough reset of authentication state");
    
    // Clear all possible auth-related storage
    clearSession();
    
    // Remove script tags to force fresh loading
    const scriptTags = document.querySelectorAll('script[id^="google-"]');
    scriptTags.forEach(tag => {
      if (tag.parentNode) {
        tag.parentNode.removeChild(tag);
      }
    });
    
    // Reset error states
    setAuthError(null);
    setSigningIn(false);
    setRetryCount(0);
    
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const handleForceReset = () => {
    console.log("Force resetting entire auth state");
    
    clearSession();
    
    // Remove ALL Google-related scripts
    const allScripts = document.querySelectorAll('script');
    allScripts.forEach(script => {
      const src = script.getAttribute('src') || '';
      if (src.includes('google') || src.includes('gstatic') || 
          script.id?.includes('google') || script.id?.includes('gapi')) {
        console.log(`Removing script: ${script.id || src}`);
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }
    });
    
    // Clear any Google API object in memory
    if (window.google) {
      try {
        // @ts-ignore - deliberately removing google object
        window.google = undefined;
      } catch (e) {
        console.error("Failed to clear google object:", e);
      }
    }
    if (window.gapi) {
      try {
        // @ts-ignore - deliberately removing gapi object
        window.gapi = undefined;
      } catch (e) {
        console.error("Failed to clear gapi object:", e);
      }
    }
    
    // Reset everything
    setAuthError(null);
    setSigningIn(false);
    setRetryCount(0);
    
    // Force hard reload (skips cache)
    setTimeout(() => {
      window.location.href = window.location.href.split('?')[0] + 
                           '?forceClear=' + Date.now();
    }, 300);
  };

  if (isInitializing) {
    return <LoadingState message="Initializing YouTube connection..." />;
  }
  
  if (!credentialsConfigured) {
    return <CredentialsError />;
  }

  const errorToDisplay = profileFetchError || authError;
  if (errorToDisplay) {
    return (
      <AuthError 
        error={errorToDisplay}
        onRetry={handleRetry}
        onClearAndRetry={handleClearAndRetry}
        onForceReset={handleForceReset}
      />
    );
  }

  if (isSignedIn && user) {
    return <UserProfile user={user} onSignOut={handleAuth} />;
  }

  return <SignInForm onSignIn={handleAuth} isSigningIn={signingIn} />;
};

export default YoutubeLogin;
