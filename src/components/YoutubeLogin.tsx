import { useYouTubeAuth } from '@/lib/youtube-auth';
import { Button } from '@/components/ui/button';
import { ThreeDotsFade } from 'react-svg-spinners';
import { Youtube, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CLIENT_ID, REDIRECT_URI } from '@/lib/youtube/config';

interface YoutubeLoginProps {
  onLoginSuccess?: () => void;
}

const YoutubeLogin = ({ onLoginSuccess }: YoutubeLoginProps) => {
  const { isSignedIn, isInitializing, user, credentialsConfigured, profileFetchError, signIn, signOut } = useYouTubeAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

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

  const errorToDisplay = profileFetchError || authError;

  if (errorToDisplay) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Problem</AlertTitle>
          <AlertDescription>{errorToDisplay}</AlertDescription>
        </Alert>
        
        <div className="text-center space-y-4">
          <AlertCircle size={40} className="mx-auto text-red-500" />
          <h2 className="text-xl font-bold text-gray-100">Authentication Problem</h2>
          <p className="text-gray-400 max-w-md">
            {profileFetchError 
              ? "We couldn't retrieve your profile information. Please try signing in again."
              : "We encountered an issue with the YouTube authentication. Please try again."}
          </p>
          
          <div className="text-sm text-gray-500 mt-4 p-2 bg-gray-800 rounded-md">
            <div className="flex justify-between items-center">
              <p>Current origin: <span className="font-mono">{window.location.origin}</span></p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs" 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
              >
                <Info className="h-3 w-3 mr-1" />
                {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
              </Button>
            </div>
            <p>Make sure this exact URL is added to the Google Cloud Console as an authorized redirect URI.</p>
          </div>
          
          {showDebugInfo && (
            <div className="mt-4 text-left text-xs p-3 bg-gray-800 rounded-md">
              <h3 className="font-bold mb-2">Debug Information:</h3>
              <ul className="space-y-1">
                <li><span className="font-semibold">Client ID:</span> {CLIENT_ID.substring(0, 8)}...{CLIENT_ID.substring(CLIENT_ID.length - 8)}</li>
                <li><span className="font-semibold">Redirect URI:</span> {REDIRECT_URI}</li>
                <li><span className="font-semibold">Full URL:</span> {window.location.href}</li>
                <li><span className="font-semibold">User Agent:</span> {navigator.userAgent}</li>
                <li><span className="font-semibold">Error Timing:</span> After success message during profile/data loading</li>
              </ul>
              <p className="mt-2 italic">If this issue persists, please clear your browser cache and cookies, then try again.</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Clear Cache & Reload
          </Button>
        </div>
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
      
      <div className="text-xs text-gray-500 max-w-sm text-center space-y-2">
        <p>
          By connecting your account, you allow VideoVerse to access your YouTube data. 
          We only analyze your content and never post or modify anything.
        </p>
        <p className="text-sm font-medium">
          ⚠️ Make sure to add <span className="bg-gray-800 p-1 rounded">{window.location.origin}</span> to your Google Cloud Console as both an authorized JavaScript origin and redirect URI.
        </p>
      </div>
    </div>
  );
};

export default YoutubeLogin;
