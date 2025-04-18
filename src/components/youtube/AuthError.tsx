
import { AlertCircle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from 'react';

interface AuthErrorProps {
  error: string;
  onRetry: () => void;
  onClearAndRetry: () => void;
}

const AuthError = ({ error, onRetry, onClearAndRetry }: AuthErrorProps) => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Problem</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      <div className="text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-gray-100">Authentication Problem</h2>
        <p className="text-gray-400 max-w-md">
          We encountered an issue with the YouTube authentication. Please try again.
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
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Try Again
        </Button>
        
        <Button
          variant="outline"
          onClick={onClearAndRetry}
        >
          Clear Cache & Reload
        </Button>
      </div>
    </div>
  );
};

export default AuthError;
