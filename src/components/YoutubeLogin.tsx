
import { useYouTubeAuth } from '@/lib/youtube-auth';
import { useState, useEffect } from 'react';
import LoadingState from './youtube/LoadingState';
import CredentialsError from './youtube/CredentialsError';
import AuthError from './youtube/AuthError';
import UserProfile from './youtube/UserProfile';
import SignInForm from './youtube/SignInForm';

interface YoutubeLoginProps {
  onLoginSuccess?: () => void;
}

const YoutubeLogin = ({ onLoginSuccess }: YoutubeLoginProps) => {
  const { isSignedIn, isInitializing, user, credentialsConfigured, profileFetchError, signIn, signOut } = useYouTubeAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // If login is successful, call the callback
  useEffect(() => {
    if (isSignedIn && user && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isSignedIn, user, onLoginSuccess]);

  const handleAuth = async () => {
    if (isSignedIn) {
      console.log("Signing out");
      await signOut();
    } else {
      try {
        console.log("Attempting to sign in");
        setAuthError(null);
        setSigningIn(true);
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
    if (retryCount >= 2) {
      // After multiple retries, try a more thorough reset
      handleClearAndRetry();
    } else {
      handleAuth();
    }
  };

  const handleClearAndRetry = () => {
    // Clear all possible auth-related storage
    localStorage.removeItem('youtube_access_token');
    localStorage.removeItem('youtube_user');
    sessionStorage.removeItem('youtube_token_timestamp');
    
    // Clear any Google cookies that might be causing issues
    document.cookie.split(';').forEach(c => {
      const cookieName = c.split('=')[0].trim();
      if (cookieName.startsWith('g_') || cookieName.includes('google')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
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

  if (isInitializing) {
    return <LoadingState />;
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
      />
    );
  }

  if (isSignedIn && user) {
    return <UserProfile user={user} onSignOut={handleAuth} />;
  }

  return <SignInForm onSignIn={handleAuth} isSigningIn={signingIn} />;
};

export default YoutubeLogin;
