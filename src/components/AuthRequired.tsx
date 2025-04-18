
import React, { useEffect, useState } from 'react';
import { useYouTubeAuth } from '@/lib/youtube-auth';
import YoutubeLogin from './YoutubeLogin';
import { Spinner } from '@/components/ui/spinner';
import { clearSession } from '@/lib/youtube/auth/session';

interface AuthRequiredProps {
  children: React.ReactNode;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { 
    isSignedIn, 
    isInitializing, 
    credentialsConfigured, 
    error, 
    accessToken 
  } = useYouTubeAuth();
  const [contentVisible, setContentVisible] = useState(false);
  const [forceReload, setForceReload] = useState(false);
  
  console.log("AuthRequired rendering with:", { 
    isSignedIn, 
    isInitializing, 
    credentialsConfigured,
    hasError: !!error,
    hasToken: !!accessToken
  });
  
  // Handle authentication errors - trigger a refresh when needed
  useEffect(() => {
    if (error) {
      console.log("Auth error detected:", error.message);
      if (error.message.includes("expired") || 
          error.message.includes("rejected") ||
          error.message.includes("revoked")) {
        console.log("Critical auth error detected, clearing session");
        clearSession();
        setForceReload(true);
      }
    }
  }, [error]);

  // Force a reload if needed
  useEffect(() => {
    if (forceReload) {
      console.log("Forcing authentication reload");
      setForceReload(false);
      const timerId = setTimeout(() => {
        window.location.reload();
      }, 300);
      return () => clearTimeout(timerId);
    }
  }, [forceReload]);
  
  // Force a re-render when authentication state changes
  useEffect(() => {
    console.log("AuthRequired: Auth state changed, isSignedIn =", isSignedIn);
    
    if (isSignedIn && accessToken) {
      console.log("User is signed in with token, showing content");
      setContentVisible(true);
    } else {
      console.log("User is not signed in or missing token, hiding content");
      setContentVisible(false);
    }
  }, [isSignedIn, accessToken]);

  // Debug logging for initialization state
  useEffect(() => {
    console.log("AuthRequired: isInitializing =", isInitializing);
    console.log("AuthRequired: credentialsConfigured =", credentialsConfigured);
  }, [isInitializing, credentialsConfigured]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8 border-t-2 mb-4" />
        <p className="text-gray-400">Initializing YouTube connection...</p>
      </div>
    );
  }

  if (!credentialsConfigured) {
    console.log("Credentials not configured, showing login");
    return <YoutubeLogin onLoginSuccess={() => setContentVisible(true)} />;
  }

  if (!isSignedIn || !accessToken) {
    console.log("Not signed in or missing token, showing login");
    return <YoutubeLogin onLoginSuccess={() => setContentVisible(true)} />;
  }

  console.log("Auth checks passed, rendering children");
  return <>{children}</>;
};

export default AuthRequired;
