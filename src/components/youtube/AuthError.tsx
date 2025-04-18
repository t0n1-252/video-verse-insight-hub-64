
import { AlertCircle, Info, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from 'react';

interface AuthErrorProps {
  error: string;
  onRetry: () => void;
  onClearAndRetry: () => void;
  onForceReset: () => void;
}

const AuthError = ({ error, onRetry, onClearAndRetry, onForceReset }: AuthErrorProps) => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Format the error message to be more user-friendly
  const getUserFriendlyError = (error: string) => {
    if (error.includes('Token rejected') || error.includes('Token has been revoked or expired')) {
      return "Your authentication token was rejected or has expired. Please sign in again.";
    }
    
    if (error.includes('Token client not initialized')) {
      return "Authentication service not ready. This might be due to a browser extension blocking Google services or a temporary connectivity issue.";
    }
    
    if (error.includes('Failed to initialize')) {
      return "Failed to initialize the authentication service. This might be a temporary issue.";
    }
    
    if (error.includes('popup')) {
      return "Authentication popup was blocked or closed. Please allow popups for this site and try again.";
    }
    
    if (error.includes('redirect_uri_mismatch')) {
      return "Authentication configuration error: Redirect URI mismatch. Please check your Google Cloud Console settings.";
    }
    
    return error;
  };
  
  // Check if error is related to token
  const isTokenError = error.toLowerCase().includes('token');
  
  // Provide specific fixes based on error type
  const getSuggestedFixes = () => {
    if (isTokenError) {
      return [
        "Use the 'Complete Reset' button below to clear all authentication data",
        "Try using an incognito/private browsing window",
        "Ensure you're using a browser without extensions that might interfere",
        "Verify your Google Cloud Console project has YouTube API enabled",
        "Check that the correct redirect URL is set in Google Cloud Console"
      ];
    }
    
    return [
      "Try the 'Complete Reset' button at the bottom to fix most issues",
      "Check if you have any browser extensions that might be blocking Google services",
      "Try using a different browser",
      "Ensure you're allowing popups for this site",
      "Make sure you're connected to the internet",
      "Verify your Google Cloud Console settings"
    ];
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Problem</AlertTitle>
        <AlertDescription>{getUserFriendlyError(error)}</AlertDescription>
      </Alert>
      
      <div className="text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-gray-100">YouTube Authentication Failed</h2>
        <p className="text-gray-400 max-w-md">
          {isTokenError 
            ? "There was a problem with your YouTube authentication token. Let's fix it!"
            : "We encountered an issue connecting to your YouTube account. Here are some things you can try:"}
        </p>
        <ul className="text-left text-gray-400 max-w-md list-disc pl-5 space-y-2">
          {getSuggestedFixes().map((fix, idx) => (
            <li key={idx}>{fix}</li>
          ))}
        </ul>
        
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
          
          {showDebugInfo && (
            <div className="mt-2 p-2 bg-gray-900 rounded text-xs">
              <p className="font-mono break-all">{error}</p>
              <p className="mt-2">Browser: {navigator.userAgent}</p>
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>Page URL: {window.location.href}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col space-y-4 w-full max-w-md">
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
        
        <Button
          variant="destructive"
          className="mt-4"
          onClick={onForceReset}
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          Complete Reset (Recommended)
        </Button>
      </div>
    </div>
  );
};

export default AuthError;
