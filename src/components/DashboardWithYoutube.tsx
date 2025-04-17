
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import VideoAnalysis from "@/pages/VideoAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useYouTubeAuth } from "@/lib/youtube-auth";
import { fetchChannelVideos, Video } from "@/lib/youtube-api";
import { ThreeDotsFade } from "react-svg-spinners";
import AuthRequired from "@/components/AuthRequired";
import { useToast } from "@/hooks/use-toast";

const DashboardWithYoutube = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const { accessToken, isSignedIn } = useYouTubeAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isSignedIn && accessToken) {
      loadVideos();
    }
  }, [accessToken, isSignedIn]);

  const loadVideos = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const videoData = await fetchChannelVideos(accessToken);
      setVideos(videoData);
      
      if (videoData.length === 0) {
        toast({
          title: "No videos found",
          description: "We couldn't find any videos in your YouTube channel.",
          variant: "default"
        });
      } else {
        toast({
          title: "Videos loaded successfully",
          description: `Found ${videoData.length} videos from your channel.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error loading videos:", error);
      toast({
        title: "Error loading videos",
        description: "There was a problem fetching your videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

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
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center p-20">
                  <ThreeDotsFade color="#3b82f6" height={40} />
                  <p className="mt-4 text-gray-400">Loading your videos...</p>
                </div>
              ) : (
                <>
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

                  {filteredVideos.length === 0 && !loading && (
                    <div className="text-center py-10">
                      <p className="text-gray-400">No videos found matching your search.</p>
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
