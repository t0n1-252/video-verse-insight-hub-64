
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import VideoAnalysis from "@/pages/VideoAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useYouTubeAuth } from "@/lib/youtube-auth";
import { Video } from "@/lib/youtube-api";
import AuthRequired from "@/components/AuthRequired";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SearchBar from "./youtube/SearchBar";
import VideoGrid from "./youtube/VideoGrid";
import VideoLoadingState from "./youtube/VideoLoadingState";
import { useYoutubeVideos } from "@/hooks/use-youtube-videos";

const DashboardWithYoutube = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { accessToken, isSignedIn, error, user } = useYouTubeAuth();
  const { toast } = useToast();
  const currentDomain = window.location.origin;
  const [attemptedLoad, setAttemptedLoad] = useState(false);

  const {
    videos,
    loading,
    loadError,
    loadVideos
  } = useYoutubeVideos(isSignedIn ? accessToken : null);

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-purple-500">Video</span>
            <span className="text-blue-400">Verse</span> Insight Hub
          </h1>
          <Button variant="outline" onClick={() => navigate('/setup')}>
            API Setup Guide
          </Button>
        </div>

        {error && error.message && error.message.includes("redirect_uri_mismatch") && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Redirect URI Mismatch Error:</strong> Please add this exact URL to the authorized JavaScript origins and redirect URIs in your Google Cloud Console:
              <div className="mt-2 p-2 bg-gray-800 rounded-md">
                <code className="text-sm break-all">{currentDomain}</code>
              </div>
              <div className="mt-2">
                After updating your Google Cloud Console settings, please refresh this page.
              </div>
            </AlertDescription>
          </Alert>
        )}

        <AuthRequired>
          <Tabs defaultValue="dashboard">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="analysis" disabled={!selectedVideo}>
                Video Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <div className="mb-8">
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={loadVideos} 
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh Videos'}
                  </Button>
                </div>
              </div>

              {loading ? (
                <VideoLoadingState />
              ) : loadError ? (
                <div>
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loadError.message}</AlertDescription>
                  </Alert>
                  <div className="flex justify-center mt-4">
                    <Button onClick={loadVideos} className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Retry Loading Videos
                    </Button>
                  </div>
                </div>
              ) : (
                <VideoGrid 
                  videos={filteredVideos}
                  onVideoSelect={setSelectedVideo}
                  onRetry={loadVideos}
                />
              )}
            </TabsContent>

            <TabsContent value="analysis">
              {selectedVideo && <VideoAnalysis video={selectedVideo} />}
            </TabsContent>
          </Tabs>
        </AuthRequired>
      </div>
    </div>
  );
};

export default DashboardWithYoutube;
