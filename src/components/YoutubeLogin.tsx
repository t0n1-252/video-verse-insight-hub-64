
import { useYouTubeAuth } from '@/lib/youtube-auth';
import { Button } from '@/components/ui/button';
import { ThreeDotsFade } from 'react-svg-spinners';
import { Youtube, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface YoutubeLoginProps {
  onLoginSuccess?: () => void;
}

const YoutubeLogin = ({ onLoginSuccess }: YoutubeLoginProps) => {
  const { isSignedIn, isInitializing, user, credentialsConfigured, signIn, signOut } = useYouTubeAuth();
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (isSignedIn) {
      await signOut();
    } else {
      await signIn();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center p-6 space-y-4">
        <ThreeDotsFade color="#3b82f6" height={24} />
        <p className="text-gray-400">Initializing YouTube API...</p>
      </div>
    );
  }
  
  if (!credentialsConfigured) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-6">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-100">YouTube API Not Configured</h2>
          <p className="text-gray-400 max-w-md">
            You need to set up your YouTube API credentials before using this feature.
          </p>
        </div>
        
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={() => navigate('/setup')}
        >
          <AlertCircle className="mr-2 h-5 w-5" />
          Go to Setup Instructions
        </Button>
      </div>
    );
  }

  if (isSignedIn && user) {
    return (
      <div className="flex flex-col items-center p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <img
            src={user.picture}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-100">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="bg-red-600 hover:bg-red-700 border-red-700 text-white"
          onClick={handleAuth}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6">
      <div className="text-center space-y-4">
        <Youtube size={48} className="mx-auto text-red-500" />
        <h2 className="text-2xl font-bold text-gray-100">Connect Your YouTube Account</h2>
        <p className="text-gray-400 max-w-md">
          Sign in with your YouTube account to access your videos, analytics, and viewer insights.
        </p>
      </div>
      
      <Button
        className="bg-red-600 hover:bg-red-700 text-white"
        size="lg"
        onClick={handleAuth}
      >
        <Youtube className="mr-2 h-5 w-5" />
        Connect YouTube
      </Button>
      
      <p className="text-xs text-gray-500 max-w-sm text-center">
        By connecting your account, you allow VideoVerse to access your YouTube data. 
        We only analyze your content and never post or modify anything.
      </p>
    </div>
  );
};

export default YoutubeLogin;
