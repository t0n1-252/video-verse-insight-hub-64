
import { useYouTubeAuth } from '@/lib/youtube-auth';
import { useState } from 'react';
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

  const handleClearAndRetry = () => {
    localStorage.removeItem('youtube_access_token');
    localStorage.removeItem('youtube_user');
    sessionStorage.removeItem('youtube_token_timestamp');
    
    document.cookie.split(';').forEach(c => {
      if (c.trim().startsWith('g_')) {
        const cookieName = c.split('=')[0];
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    window.location.reload();
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
        onRetry={handleAuth}
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
