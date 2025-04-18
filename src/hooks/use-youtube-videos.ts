
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Video, fetchChannelVideos } from '@/lib/youtube-api';
import { YouTubeAPIError, YouTubeError } from '@/lib/youtube/types/error-types';

export function useYoutubeVideos(accessToken: string | null) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<YouTubeAPIError | null>(null);
  const [attemptedLoad, setAttemptedLoad] = useState(false);
  const { toast } = useToast();

  const loadVideos = async () => {
    if (!accessToken) {
      const error: YouTubeAPIError = {
        type: 'AUTH_ERROR',
        message: 'Authentication token is missing. Please try signing in again.'
      };
      setLoadError(error);
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
        const error: YouTubeAPIError = {
          type: 'NO_VIDEOS_FOUND',
          message: 'No videos were found in your YouTube channel.'
        };
        setLoadError(error);
        toast({
          title: "No videos found",
          description: error.message,
          variant: "default"
        });
      }
    } catch (error: unknown) {
      console.error("Error loading videos:", error);
      
      let apiError: YouTubeAPIError;
      
      if (error instanceof YouTubeError) {
        apiError = {
          type: error.type,
          message: error.message,
          originalError: error.originalError
        };
      } else if (error instanceof Error) {
        if (error.message.includes('channel')) {
          apiError = {
            type: 'CHANNEL_NOT_FOUND',
            message: 'Unable to find your YouTube channel. Please ensure you have a channel associated with your account.',
            originalError: error
          };
        } else if (error.message.includes('network')) {
          apiError = {
            type: 'NETWORK_ERROR',
            message: 'Network error occurred while fetching videos. Please check your internet connection.',
            originalError: error
          };
        } else {
          apiError = {
            type: 'API_ERROR',
            message: 'An error occurred while loading your videos: ' + error.message,
            originalError: error
          };
        }
      } else {
        apiError = {
          type: 'API_ERROR',
          message: 'An unexpected error occurred while loading videos.',
          originalError: error
        };
      }
      
      setLoadError(apiError);
      setVideos([]);
      toast({
        title: "Error loading videos",
        description: apiError.message,
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
