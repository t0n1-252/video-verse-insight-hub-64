
import { Video } from '../types/api-types';
import { initializeAndPrepareGapi, loadYouTubeAPI } from './gapi-helpers';

export const fetchChannelVideos = async (accessToken: string): Promise<Video[]> => {
  try {
    console.log("fetchChannelVideos called with token length:", accessToken?.length);
    console.log("Token starts with:", accessToken?.substring(0, 5) + "...");
    
    await initializeAndPrepareGapi(accessToken);
    window.gapi.client.setToken({ access_token: accessToken });
    console.log('Token set in GAPI client');
    
    if (!window.gapi.client.youtube) {
      console.log('YouTube API not loaded yet, loading it now');
      await loadYouTubeAPI();
      window.gapi.client.setToken({ access_token: accessToken });
    }
    
    console.log('Beginning to fetch videos, YouTube API available:', !!window.gapi.client.youtube);
    
    const channelResponse = await window.gapi.client.youtube.channels.list({
      part: 'id,snippet',
      mine: true
    });
    
    if (!channelResponse.result || !channelResponse.result.items || channelResponse.result.items.length === 0) {
      console.error('No channel found for the authenticated user');
      throw new Error('No YouTube channel found for this account');
    }
    
    const channelId = channelResponse.result.items[0].id;
    console.log('Retrieved channel ID:', channelId);
    
    const channelContentResponse = await window.gapi.client.youtube.channels.list({
      part: 'contentDetails',
      id: channelId
    });
    
    if (!channelContentResponse.result?.items?.[0]) {
      throw new Error('No content details found for the channel');
    }
    
    const uploadsPlaylistId = channelContentResponse.result.items[0].contentDetails.relatedPlaylists.uploads;
    
    const playlistItemsResponse = await window.gapi.client.youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 50
    });
    
    if (!playlistItemsResponse.result?.items) {
      return [];
    }
    
    const videoIds = playlistItemsResponse.result.items.map(item => 
      item.contentDetails.videoId
    );
    
    if (videoIds.length === 0) {
      return [];
    }
    
    const videosResponse = await window.gapi.client.youtube.videos.list({
      part: 'snippet,statistics',
      id: videoIds.join(',')
    });
    
    if (!videosResponse.result?.items) {
      return [];
    }
    
    return videosResponse.result.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : '',
      publishDate: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount || '0', 10),
      likeCount: parseInt(item.statistics.likeCount || '0', 10),
      commentCount: parseInt(item.statistics.commentCount || '0', 10)
    }));
  } catch (error) {
    console.error('Error in fetchChannelVideos:', error);
    throw error;
  }
};
