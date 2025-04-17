
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";

const APICredentialsGuide = () => {
  const { toast } = useToast();
  const currentOrigin = window.location.origin;
  const isPreviewDomain = currentOrigin.includes('preview--') || currentOrigin.includes('lovable.app');

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: description,
      duration: 3000,
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-gray-100">YouTube API Setup Instructions</CardTitle>
        <CardDescription className="text-gray-400">
          Follow these steps to configure your YouTube API credentials
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-white mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <AlertDescription className="text-white">
            <strong>Important:</strong> You are currently on: <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">{currentOrigin}</code>
            <p className="mt-2">
              You <strong>must</strong> add this exact URL to both the authorized JavaScript origins AND authorized redirect URIs in your Google Cloud Console.
            </p>
          </AlertDescription>
        </Alert>
        
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
            <li className="font-semibold text-amber-400">Add authorized JavaScript origins:
              <div className="flex items-center space-x-2 ml-4 my-2 p-2 bg-gray-800 rounded">
                <code className="text-white break-all">{currentOrigin}</code>
                <button 
                  onClick={() => copyToClipboard(currentOrigin, "Origin copied to clipboard")}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="text-sm text-gray-400 ml-4 mt-1">
                <strong>Important:</strong> You must add the <em>exact</em> URL shown above, including the protocol (https://) and without any trailing slash.
              </div>
            </li>
            <li className="font-semibold text-amber-400">Add authorized redirect URIs (MANDATORY FOR LOGIN):
              <div className="flex items-center space-x-2 ml-4 my-2 p-2 bg-gray-800 rounded">
                <code className="text-white break-all">{currentOrigin}</code>
                <button 
                  onClick={() => copyToClipboard(currentOrigin, "Redirect URI copied to clipboard")}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="text-sm text-red-300 ml-4 mt-1 font-bold">
                <strong>CRITICAL:</strong> You MUST add the exact URL above as a redirect URI or authentication will fail with a "redirect_uri_mismatch" error.
              </div>
            </li>
            <li>Click &quot;Create&quot; and note down your Client ID and Client Secret</li>
          </ol>
        </div>
        
        <div className="bg-amber-900/30 border border-amber-700/50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-amber-400 mb-2">Common OAuth Errors & Solutions</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li><span className="font-semibold text-red-300">redirect_uri_mismatch</span>: This means the exact URI of this application is NOT listed in the authorized redirect URIs in Google Cloud Console</li>
            <li><span className="font-semibold">JavaScript origin mismatch</span>: Make sure the exact origin (protocol, domain, port) is listed in authorized JavaScript origins</li>
            <li><span className="font-semibold">Invalid client</span>: Make sure your client ID is correct and belongs to this project</li>
            <li><span className="font-semibold">OAuth 2.0 policy non-compliance</span>: This means your app origin isn't correctly registered. Double-check the JavaScript origins match exactly</li>
            <li>For localhost testing, add both <code className="bg-gray-700 px-1 rounded">http://localhost:5173</code> (or your Vite port) and <code className="bg-gray-700 px-1 rounded">http://127.0.0.1:5173</code></li>
            <li>For Lovable preview domains (like <code className="bg-gray-700 px-1 rounded">https://preview--your-app.lovable.app</code>), you need to add the full preview URL</li>
          </ul>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-100 mb-2">Step 4: Configure the Application</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Open the file <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">src/lib/youtube-auth.ts</code></li>
            <li>Replace the placeholders with your credentials:
              <pre className="bg-gray-700 p-2 rounded text-sm overflow-x-auto mt-2">
{`const API_KEY = ''; // optional
const CLIENT_ID = 'YOUR_CLIENT_ID';`}
              </pre>
            </li>
          </ol>
        </div>
        
        <div className="bg-blue-900/30 border border-blue-700/50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-blue-400 mb-2">After Updating Credentials</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>After adding new origins or redirect URIs, <strong>wait a few minutes</strong> for changes to propagate</li>
            <li>Clear your browser cache and cookies for Google domains</li>
            <li>Try using incognito/private browsing mode to test</li>
            <li>If your app is deployed to a different URL, you'll need to update the credentials for each deployment URL</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button variant="outline" className="w-full" onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Manage OAuth Credentials
        </Button>
        <Button variant="outline" className="w-full" onClick={() => window.open('https://console.cloud.google.com/', '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Google Cloud Console
        </Button>
      </CardFooter>
    </Card>
  );
};

export default APICredentialsGuide;
