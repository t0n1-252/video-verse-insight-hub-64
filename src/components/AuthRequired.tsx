
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
  
  // Force a re-render when authentication state changes
  useEffect(() => {
    if (isSignedIn) {
      setContentVisible(true);
    } else {
      setContentVisible(false);
    }
  }, [isSignedIn]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8 border-t-2 mb-4" />
        <p className="text-gray-400">Initializing YouTube connection...</p>
      </div>
    );
  }

  if (!credentialsConfigured) {
    return <YoutubeLogin onLoginSuccess={() => setContentVisible(true)} />;
  }

  if (!isSignedIn) {
    return <YoutubeLogin onLoginSuccess={() => setContentVisible(true)} />;
  }

  return <>{children}</>;
};

export default AuthRequired;
