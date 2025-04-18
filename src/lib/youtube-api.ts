
// YouTube API service functions
import { fetchUserProfile } from './youtube/user-profile';

// Define interfaces for video types
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishDate: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  authorName: string;
  authorProfileImageUrl: string;
  text: string;
  likeCount: number;
  publishedAt: string;
  updatedAt: string;
  isPriority: boolean;
  isQuestion: boolean;
  isComplaint: boolean;
}

// Function to fetch videos from the user's channel
export const fetchChannelVideos = async (accessToken: string): Promise<Video[]> => {
  try {
    console.log("fetchChannelVideos called with token length:", accessToken?.length);
    console.log("Token starts with:", accessToken?.substring(0, 5) + "...");
    
    // First ensure GAPI is loaded and initialized
    await initializeAndPrepareGapi(accessToken);
    
    // This is important: we need to set the token in GAPI client every time
    window.gapi.client.setToken({ access_token: accessToken });
    console.log('Token set in GAPI client');
    
    // Verify YouTube API is loaded
    if (!window.gapi.client.youtube) {
      console.log('YouTube API not loaded yet, loading it now');
      await loadYouTubeAPI();
      
      // Set token again after loading
      window.gapi.client.setToken({ access_token: accessToken });
    }
    
    console.log('Beginning to fetch videos, YouTube API available:', !!window.gapi.client.youtube);
    
    // Get the authenticated user's channel ID
    console.log('Requesting user channel');
    const channelResponse = await window.gapi.client.youtube.channels.list({
      part: 'id,snippet',
      mine: true
    });
    
    console.log('Channel response received:', channelResponse);
    
    if (!channelResponse.result || !channelResponse.result.items || channelResponse.result.items.length === 0) {
      console.error('No channel found for the authenticated user');
      throw new Error('No YouTube channel found for this account');
    }
    
    const channelId = channelResponse.result.items[0].id;
    console.log('Retrieved channel ID:', channelId);
    
    // Get the uploads playlist ID which contains all uploaded videos
    const channelContentResponse = await window.gapi.client.youtube.channels.list({
      part: 'contentDetails',
      id: channelId
    });
    
    console.log('Channel content response received:', channelContentResponse);
    
    if (!channelContentResponse.result || !channelContentResponse.result.items || channelContentResponse.result.items.length === 0) {
      console.error('No content details found for the channel');
      throw new Error('No content details found for the channel');
    }
    
    const uploadsPlaylistId = channelContentResponse.result.items[0].contentDetails.relatedPlaylists.uploads;
    console.log('Retrieved uploads playlist ID:', uploadsPlaylistId);
    
    // Get the videos in the uploads playlist
    const playlistItemsResponse = await window.gapi.client.youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 50
    });
    
    console.log('Playlist items response received:', playlistItemsResponse);
    
    if (!playlistItemsResponse.result || !playlistItemsResponse.result.items) {
      console.error('No videos found in the uploads playlist');
      return [];
    }
    
    const videoIds = playlistItemsResponse.result.items.map(item => 
      item.contentDetails.videoId
    );
    
    console.log('Video IDs extracted:', videoIds);
    
    if (videoIds.length === 0) {
      console.log('No videos found on this channel');
      return [];
    }
    
    // Get detailed info for each video
    const videosResponse = await window.gapi.client.youtube.videos.list({
      part: 'snippet,statistics',
      id: videoIds.join(',')
    });
    
    console.log('Videos response received:', videosResponse);
    
    if (!videosResponse.result || !videosResponse.result.items) {
      console.error('Failed to get video details');
      return [];
    }
    
    // Map the response to our Video interface
    const videos: Video[] = videosResponse.result.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : '',
      publishDate: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount || '0', 10),
      likeCount: parseInt(item.statistics.likeCount || '0', 10),
      commentCount: parseInt(item.statistics.commentCount || '0', 10)
    }));
    
    console.log(`Successfully fetched ${videos.length} videos`);
    return videos;
  } catch (error) {
    console.error('Error in fetchChannelVideos:', error);
    throw error;
  }
};

// Improved initialization function to ensure GAPI is fully loaded
const initializeAndPrepareGapi = async (accessToken: string): Promise<void> => {
  if (!window.gapi) {
    throw new Error('Google API client not available - please check if it loaded correctly');
  }
  
  // Initialize client if not already done
  if (!window.gapi.client) {
    await new Promise<void>((resolve, reject) => {
      window.gapi.load('client', {
        callback: () => {
          try {
            window.gapi.client.init({
              apiKey: '', // No API key needed for OAuth flow
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
            }).then(() => {
              resolve();
            }).catch((err: any) => {
              reject(err);
            });
          } catch (err) {
            reject(err);
          }
        },
        onerror: (err) => {
          console.error('Error loading GAPI client:', err);
          reject(err);
        }
      });
    });
  }
  
  // Always set the token
  window.gapi.client.setToken({ access_token: accessToken });
};

// Helper function to load the YouTube API
const loadYouTubeAPI = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    window.gapi.client.load('youtube', 'v3', () => {
      console.log('YouTube API loaded successfully');
      resolve();
    });
  });
};

// Function to fetch comments for a specific video
export const fetchVideoComments = async (accessToken: string, videoId: string): Promise<Comment[]> => {
  console.log(`Fetch comments called for video ${videoId}`);
  return [];
};

// Analyze sentiment of comments (stub implementation)
export const analyzeSentiment = (comments: Comment[]): { positive: number; neutral: number; negative: number } => {
  return { positive: 0, neutral: 0, negative: 0 };
};

// Generate content ideas based on comments (stub implementation)
export const generateContentOpportunities = (comments: Comment[]): any[] => {
  return [];
};
