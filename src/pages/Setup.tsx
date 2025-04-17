
import React from 'react';
import APICredentialsGuide from '@/components/APICredentialsGuide';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Setup = () => {
  const location = useLocation();
  const hasError = location.state?.error;
  const errorMessage = location.state?.message || "Please configure your YouTube API credentials";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-purple-500">Video</span>
          <span className="text-blue-400">Verse</span> Setup
        </h1>
        <p className="text-gray-400 mb-8">Configure your YouTube API credentials to use this application.</p>
        
        {hasError && (
          <Alert variant="destructive" className="mb-6 bg-red-900/30 border-red-700 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="max-w-4xl mx-auto">
          <APICredentialsGuide />
        </div>
      </div>
    </div>
  );
};

export default Setup;
