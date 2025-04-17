
import { useYouTubeAuth } from '@/lib/youtube-auth';
import { Button } from '@/components/ui/button';
import { ThreeDotsFade } from 'react-svg-spinners';
import { Youtube, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface YoutubeLoginProps {
  onLoginSuccess?: () => void;
}

const YoutubeLogin = ({ onLoginSuccess }: YoutubeLoginProps) => {
  const { isSignedIn, isInitializing, user, credentialsConfigured, signIn, signOut } = useYouTubeAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  // Add this effect to trigger onLoginSuccess when isSignedIn changes to true
  useEffect(() => {
    console.log("YoutubeLogin: isSignedIn =", isSignedIn, "callback exists =", !!onLoginSuccess);
    
    if (isSignedIn && onLoginSuccess) {
      console.log("Calling login success callback");
      onLoginSuccess();
    }
  }, [isSignedIn, onLoginSuccess]);

  const handleAuth = async () => {
    if (isSignedIn) {
      console.log("Signing out");
      await signOut();
    } else {
      try {
        console.log("Attempting to sign in");
        setSigningIn(true);
        await signIn();
        console.log("Sign in process initiated successfully");
        // The onLoginSuccess will be triggered by the useEffect above when isSignedIn changes
      } catch (error) {
        console.error("Authentication error:", error);
        setSigningIn(false);
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
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const div = document.createElement('div');
                div.className = 'w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center';
                div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                parent.prepend(div);
              }
            }}
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
        disabled={signingIn}
      >
        {signingIn ? (
          <>
            <ThreeDotsFade className="mr-2" color="white" height={20} />
            Connecting...
          </>
        ) : (
          <>
            <Youtube className="mr-2 h-5 w-5" />
            Connect YouTube
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 max-w-sm text-center">
        By connecting your account, you allow VideoVerse to access your YouTube data. 
        We only analyze your content and never post or modify anything.
      </p>
    </div>
  );
};

export default YoutubeLogin;
