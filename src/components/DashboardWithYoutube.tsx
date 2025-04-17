
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, RefreshCw } from "lucide-react";
import VideoAnalysis from "@/pages/VideoAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useYouTubeAuth } from "@/lib/youtube-auth";
import { fetchChannelVideos, Video } from "@/lib/youtube-api";
import { ThreeDotsFade } from "react-svg-spinners";
import AuthRequired from "@/components/AuthRequired";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DashboardWithYoutube = () => {
  console.log("DashboardWithYoutube component rendering");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { accessToken, isSignedIn, error, user } = useYouTubeAuth();
  const { toast } = useToast();
  const currentDomain = window.location.origin;
  const [attemptedLoad, setAttemptedLoad] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("DashboardWithYoutube mounted");
    console.log("Initial state:", { 
      videosCount: videos.length, 
      isSignedIn, 
      hasAccessToken: !!accessToken,
      attemptedLoad
    });
  }, []);

  // Log auth state changes for debugging
  useEffect(() => {
    console.log("Auth state changed:", { 
      isSignedIn, 
      accessTokenLength: accessToken?.length || 0 
    });
    
    if (isSignedIn && accessToken) {
      console.log('User is signed in with access token');
      
      if (!attemptedLoad) {
        console.log('First sign-in detected, loading videos automatically');
        setAttemptedLoad(true);
        
        // Add a small delay before loading videos to ensure everything is initialized
        setTimeout(() => {
          loadVideos();
        }, 2000);
      }
    }
  }, [isSignedIn, accessToken]);

  const loadVideos = async () => {
    if (!accessToken) {
      console.error('No access token available for loadVideos');
      setLoadError('Authentication token is missing. Please try signing in again.');
      return;
    }
    
    try {
      setLoading(true);
      setLoadError(null);
      
      console.log('Starting video fetch with token length:', accessToken.length);
      console.log('Token prefix for debugging:', accessToken.substring(0, 10) + '...');
      
      // More detailed logging around GAPI availability
      console.log('GAPI available:', !!window.gapi);
      console.log('GAPI client available:', !!window.gapi?.client);
      console.log('YouTube API available:', !!window.gapi?.client?.youtube);
      
      // Attempt to fetch videos with multiple retries
      let videoData: Video[] = [];
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`Attempt ${attempts + 1}/${maxAttempts} to fetch videos`);
          videoData = await fetchChannelVideos(accessToken);
          console.log(`Video data received on attempt ${attempts + 1}:`, videoData?.length || 0, 'videos');
          
          if (videoData && videoData.length > 0) {
            break; // Success! Exit the retry loop
          }
          
          // If we get here, we got an empty array - wait and retry
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          attempts++;
        } catch (err) {
          console.error(`Error in attempt ${attempts + 1}:`, err);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          attempts++;
          
          if (attempts >= maxAttempts) {
            throw err; // Re-throw on final attempt
          }
        }
      }
      
      if (videoData && videoData.length > 0) {
        setVideos(videoData);
        
        toast({
          title: "Videos loaded successfully",
          description: `Found ${videoData.length} videos from your channel.`,
          variant: "default"
        });
      } else {
        // If no videos found, set empty array
        console.log('No videos found from API');
        setVideos([]);
        
        toast({
          title: "No videos found",
          description: "No videos were found in your YouTube channel.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error loading videos:", error);
      const errorMessage = error.message || "Unknown error occurred";
      setLoadError(`Failed to load videos: ${errorMessage}`);
      
      // Set empty videos array on error
      setVideos([]);
      
      toast({
        title: "Error loading videos",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAttemptedLoad(true);
    loadVideos();
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug output to ensure we have videos
  console.log("Current videos state:", videos.length, "videos");
  console.log("Filtered videos:", filteredVideos.length, "videos");

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
          {isSignedIn && user ? (
            <div className="mb-4 p-4 bg-gray-800 rounded-md">
              <div className="flex items-center">
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full mr-3" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const div = document.createElement('div');
                        div.className = 'w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3';
                        div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                        parent.prepend(div);
                      }
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  {user.email && <p className="text-sm text-gray-400">{user.email}</p>}
                </div>
              </div>
            </div>
          ) : isSignedIn ? (
            <div className="mb-4 p-4 bg-gray-800 rounded-md">
              <p className="text-yellow-400">Connected to YouTube, but user profile could not be loaded.</p>
            </div>
          ) : null}

          <Tabs defaultValue="dashboard">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="analysis" disabled={!selectedVideo}>
                Video Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search videos..."
                    className="pl-10 bg-gray-800 border-gray-700 text-gray-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleRetry} 
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh Videos'}
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center p-20">
                  <ThreeDotsFade color="#3b82f6" height={40} />
                  <p className="mt-4 text-gray-400">Loading your videos...</p>
                </div>
              ) : loadError ? (
                <div>
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loadError}</AlertDescription>
                  </Alert>
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleRetry} className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Retry Loading Videos
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {filteredVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVideos.map(video => (
                        <Card 
                          key={video.id}
                          className="bg-gray-800 border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
                          onClick={() => handleVideoSelect(video)}
                        >
                          <CardHeader className="pb-2">
                            <div className="aspect-video bg-gray-700 mb-2 overflow-hidden">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://placehold.co/600x400/666/fff?text=No+Thumbnail';
                                }}
                              />
                            </div>
                            <CardTitle className="text-lg text-gray-100">{video.title}</CardTitle>
                            <CardDescription className="text-gray-400">
                              Published: {new Date(video.publishDate).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">{video.viewCount} views</span>
                              <span className="text-blue-400">{video.commentCount} comments</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-400">
                        {videos.length === 0 
                          ? "No videos found in your channel. Try uploading some videos first!" 
                          : "No videos found matching your search."}
                      </p>
                      <Button 
                        onClick={handleRetry} 
                        className="mt-4 flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry Loading Videos
                      </Button>
                    </div>
                  )}
                </>
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

