
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const APICredentialsGuide = () => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-gray-100">YouTube API Setup Instructions</CardTitle>
        <CardDescription className="text-gray-400">
          Follow these steps to configure your YouTube API credentials
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-900 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Step 1: Create a Google Cloud Project</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a></li>
            <li>Create a new project or select an existing one</li>
            <li>Make note of your Project ID</li>
          </ol>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Step 2: Enable the YouTube Data API</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>In your Google Cloud Project, go to &quot;APIs &amp; Services&quot; &gt; &quot;Library&quot;</li>
            <li>Search for &quot;YouTube Data API v3&quot;</li>
            <li>Click on it and press &quot;Enable&quot;</li>
          </ol>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Step 3: Create OAuth Credentials</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Go to &quot;APIs &amp; Services&quot; &gt; &quot;Credentials&quot;</li>
            <li>Click &quot;Create Credentials&quot; and select &quot;OAuth client ID&quot;</li>
            <li>Set the application type to &quot;Web application&quot;</li>
            <li>Add authorized JavaScript origins:
              <ul className="list-disc list-inside ml-4 text-gray-400">
                <li>http://localhost:8080 (for local development)</li>
                <li>Your production domain (if applicable)</li>
              </ul>
            </li>
            <li>Add authorized redirect URIs:
              <ul className="list-disc list-inside ml-4 text-gray-400">
                <li>http://localhost:8080 (for local development)</li>
                <li>Your production domain (if applicable)</li>
              </ul>
            </li>
            <li>Click &quot;Create&quot; and note down your Client ID and Client Secret</li>
          </ol>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Step 4: Configure the Application</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Open the file <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">src/lib/youtube-auth.ts</code></li>
            <li>Replace the placeholders with your credentials:
              <pre className="bg-gray-700 p-2 rounded text-sm overflow-x-auto mt-2">
{`const API_KEY = 'YOUR_API_KEY';
const CLIENT_ID = 'YOUR_CLIENT_ID';`}
              </pre>
            </li>
          </ol>
        </div>
        
        <div className="bg-amber-900/30 border border-amber-700/50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-amber-400 mb-2">Important Security Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>In a production environment, you should not store API keys directly in your code</li>
            <li>Consider using environment variables or a secure backend service</li>
            <li>Be sure to restrict your API key in the Google Cloud Console</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => window.open('https://console.cloud.google.com/', '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Google Cloud Console
        </Button>
      </CardFooter>
    </Card>
  );
};

export default APICredentialsGuide;
