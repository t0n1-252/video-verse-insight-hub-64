
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Video, fetchChannelVideos } from '@/lib/youtube-api';

export function useYoutubeVideos(accessToken: string | null) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attemptedLoad, setAttemptedLoad] = useState(false);
  const { toast } = useToast();

  const loadVideos = async () => {
    if (!accessToken) {
      setLoadError('Authentication token is missing. Please try signing in again.');
      return;
    }
    
    try {
      setLoading(true);
      setLoadError(null);
      
      const videoData = await fetchChannelVideos(accessToken);
      
      if (videoData && videoData.length > 0) {
        setVideos(videoData);
        toast({
          title: "Videos loaded successfully",
          description: `Found ${videoData.length} videos from your channel.`,
          variant: "default"
        });
      } else {
        setVideos([]);
        toast({
          title: "No videos found",
          description: "No videos were found in your YouTube channel.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error loading videos:", error);
      setLoadError(`Failed to load videos: ${error.message || "Unknown error occurred"}`);
      setVideos([]);
      toast({
        title: "Error loading videos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && !attemptedLoad) {
      setAttemptedLoad(true);
      setTimeout(() => {
        loadVideos();
      }, 2000);
    }
  }, [accessToken]);

  return {
    videos,
    loading,
    loadError,
    attemptedLoad,
    loadVideos,
  };
}
