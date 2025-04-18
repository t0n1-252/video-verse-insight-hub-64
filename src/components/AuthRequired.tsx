
import React, { useEffect, useState } from 'react';
import { useYouTubeAuth } from '@/lib/youtube-auth';
import YoutubeLogin from './YoutubeLogin';
import { Spinner } from '@/components/ui/spinner';
import { clearSession } from '@/lib/youtube/auth/session';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  const [domainInfo, setDomainInfo] = useState({
    current: window.location.hostname,
    origin: window.location.origin
  });
  
  console.log("AuthRequired rendering with:", { 
    isSignedIn, 
    isInitializing, 
    credentialsConfigured,
    hasError: !!error,
    hasToken: !!accessToken,
    domain: domainInfo.current
  });
  
  // Handle authentication errors - trigger a refresh when needed
  useEffect(() => {
    if (error) {
      console.log("Auth error detected:", error.message);
      // Expanded list of critical errors that require session clearing
      const criticalErrors = [
        "expired", "rejected", "revoked", "invalid_grant", 
        "runtime.lastError", "message channel closed", "token",
        "invalid", "oauth2", "redirect_uri_mismatch", "permission"
      ];
      
      const isCriticalError = criticalErrors.some(errText => 
        error.message.toLowerCase().includes(errText.toLowerCase())
      );
      
      if (isCriticalError) {
        console.log("Critical auth error detected, clearing session");
        clearSession();
        setForceReload(true);
      }
    }
  }, [error]);

  // Force a reload if needed with a more predictable approach
  useEffect(() => {
    if (forceReload) {
      console.log("Forcing authentication reload");
      setForceReload(false);
      
      // Add a cache-busting parameter to the URL
      const separator = window.location.href.includes('?') ? '&' : '?';
      const cacheBuster = `reload=${Date.now()}`;
      const newUrl = `${window.location.href}${separator}${cacheBuster}`;
      
      const timerId = setTimeout(() => {
        window.location.href = newUrl;
      }, 500);
      
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
    console.log("AuthRequired: Current domain =", domainInfo.current);
    console.log("AuthRequired: Current origin =", domainInfo.origin);
  }, [isInitializing, credentialsConfigured, domainInfo]);

  // Show domain mismatch warning if applicable
  const showDomainWarning = error && error.message.includes('redirect_uri_mismatch');

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8 border-t-2 mb-4" />
        <p className="text-gray-400">
          Initializing YouTube connection for {domainInfo.current}...
        </p>
      </div>
    );
  }

  if (showDomainWarning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Domain Mismatch Error:</strong> Please add this exact URL to your Google Cloud Console:
            <div className="mt-2 p-2 bg-gray-800 rounded-md">
              <code className="text-sm break-all">{window.location.origin}</code>
            </div>
          </AlertDescription>
        </Alert>
        <YoutubeLogin onLoginSuccess={() => setContentVisible(true)} />
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
