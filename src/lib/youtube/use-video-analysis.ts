
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { Video } from "@/lib/youtube-api";

interface StoredVideoAnalysis {
  id: string;
  youtube_user_id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  publish_date: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  analysis_data: any;
}

export function useVideoAnalysis(youtubeUserId: string, videoId: string | null) {
  return useQuery({
    queryKey: ['video-analysis', youtubeUserId, videoId],
    queryFn: async (): Promise<StoredVideoAnalysis | null> => {
      if (!videoId || !youtubeUserId) return null;

      const { data, error } = await supabase
        .from('analyzed_videos')
        .select('*')
        .eq('youtube_user_id', youtubeUserId)
        .eq('video_id', videoId)
        .single();

      if (error) {
        console.error('Error fetching video analysis:', error);
        return null;
      }

      return data;
    },
    enabled: !!youtubeUserId && !!videoId,
  });
}

export function useStoreVideoAnalysis() {
  return useMutation({
    mutationFn: async ({ 
      youtubeUserId, 
      video, 
      analysisData 
    }: { 
      youtubeUserId: string;
      video: Video;
      analysisData: any;
    }) => {
      const { data, error } = await supabase
        .from('analyzed_videos')
        .upsert({
          youtube_user_id: youtubeUserId,
          video_id: video.id,
          title: video.title,
          thumbnail: video.thumbnail,
          publish_date: video.publishDate,
          view_count: video.viewCount,
          comment_count: video.commentCount,
          analysis_data: analysisData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'youtube_user_id,video_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing video analysis:', error);
        throw error;
      }

      return data;
    }
  });
}
