
import { Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThreeDotsFade } from 'react-svg-spinners';
import { REDIRECT_URI } from '@/lib/youtube/config';

interface SignInFormProps {
  onSignIn: () => void;
  isSigningIn: boolean;
}

const SignInForm = ({ onSignIn, isSigningIn }: SignInFormProps) => {
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
        onClick={onSignIn}
        disabled={isSigningIn}
      >
        {isSigningIn ? (
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
          ⚠️ Make sure to add the following URL to your Google Cloud Console:
        </p>
        <div className="text-left bg-gray-800 p-2 rounded text-xs">
          <p className="font-semibold">JavaScript Origin:</p>
          <code className="block p-1 bg-black rounded">{window.location.origin}</code>
          
          <p className="font-semibold mt-2">Redirect URI:</p>
          <code className="block p-1 bg-black rounded">{REDIRECT_URI}</code>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
