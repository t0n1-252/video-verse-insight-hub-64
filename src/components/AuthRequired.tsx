
import React, { useEffect, useState } from 'react';
import { useYouTubeAuth } from '@/lib/youtube-auth';
import YoutubeLogin from './YoutubeLogin';
import { Spinner } from '@/components/ui/spinner';

interface AuthRequiredProps {
  children: React.ReactNode;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { isSignedIn, isInitializing, credentialsConfigured } = useYouTubeAuth();
  const [contentVisible, setContentVisible] = useState(false);
  
  console.log("AuthRequired rendering with:", { isSignedIn, isInitializing, credentialsConfigured });
  
  // Force a re-render when authentication state changes
  useEffect(() => {
    console.log("AuthRequired: Auth state changed, isSignedIn =", isSignedIn);
    
    if (isSignedIn) {
      console.log("User is signed in, showing content");
      setContentVisible(true);
    } else {
      console.log("User is not signed in, hiding content");
      setContentVisible(false);
    }
  }, [isSignedIn]);

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

  if (!isSignedIn) {
    console.log("Not signed in, showing login");
    return <YoutubeLogin onLoginSuccess={() => setContentVisible(true)} />;
  }

  console.log("Auth checks passed, rendering children");
  return <>{children}</>;
};

export default AuthRequired;
