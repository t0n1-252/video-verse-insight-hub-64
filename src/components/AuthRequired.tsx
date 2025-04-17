
import React from 'react';
import { useYouTubeAuth } from '@/lib/youtube-auth';
import YoutubeLogin from './YoutubeLogin';
import { Spinner } from '@/components/ui/spinner';

interface AuthRequiredProps {
  children: React.ReactNode;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { isSignedIn, isInitializing } = useYouTubeAuth();

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8 border-t-2 mb-4" />
        <p className="text-gray-400">Initializing YouTube connection...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <YoutubeLogin />;
  }

  return <>{children}</>;
};

export default AuthRequired;
