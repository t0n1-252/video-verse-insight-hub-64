
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
    
    // First check if we can access the gapi client
    if (!window.gapi) {
      console.error('GAPI not available');
      throw new Error('Google API client not available');
    }
    
    if (!window.gapi.client) {
      console.error('GAPI client not available');
      throw new Error('Google API client not initialized');
    }
    
    if (!accessToken) {
      console.error('No access token provided');
      throw new Error('No access token provided');
    }
    
    console.log('Setting up YouTube API with token...');
    
    // Set up the API with the provided access token
    window.gapi.client.setApiKey('');
    window.gapi.client.setToken({ access_token: accessToken });
    console.log('Token set in GAPI client');
    
    // Force load YouTube API explicitly
    return new Promise<Video[]>((resolve, reject) => {
      // Ensure YouTube API is available
      if (!window.gapi.client.youtube) {
        console.log('YouTube API not initialized, loading explicitly...');
        
        // Fix for the error - gapi.client.load needs a callback as the third argument
        window.gapi.client.load('youtube', 'v3', () => {
          console.log('YouTube API loaded explicitly, proceeding with fetch');
          // Reset token after initialization
          window.gapi.client.setToken({ access_token: accessToken });
          
          fetchVideosAfterInit(accessToken)
            .then(videos => {
              console.log(`Fetched ${videos.length} videos after explicit API loading`);
              resolve(videos);
            })
            .catch(err => {
              console.error('Error fetching videos after API init:', err);
              reject(err);
            });
        });
      } else {
        console.log('YouTube API already initialized, proceeding with fetch');
        // API already initialized, fetch directly
        fetchVideosAfterInit(accessToken)
          .then(videos => {
            console.log(`Fetched ${videos.length} videos with existing API`);
            resolve(videos);
          })
          .catch(err => {
            console.error('Error fetching videos directly:', err);
            reject(err);
          });
      }
    });
  } catch (error) {
    console.error('Error in fetchChannelVideos:', error);
    throw error;
  }
};

// Helper function to fetch videos after API initialization
const fetchVideosAfterInit = async (accessToken: string): Promise<Video[]> => {
  try {
    // Make sure token is set before making requests
    window.gapi.client.setToken({ access_token: accessToken });
    
    // Debug output to trace execution
    console.log('Fetching videos after init with token, YouTube API available:', !!window.gapi.client.youtube);
    
    // Add safety delay to ensure API is fully initialized
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    console.error('Error in fetchVideosAfterInit:', error);
    throw error;
  }
};

// Function to fetch comments for a specific video
export const fetchVideoComments = async (accessToken: string, videoId: string): Promise<Comment[]> => {
  // This would be implemented to fetch real comments from the YouTube API
  // For now, returning an empty array until we implement real comment fetching
  console.log(`Fetch comments called for video ${videoId}`);
  return [];
};

// Analyze sentiment of comments (mock implementation)
export const analyzeSentiment = (comments: Comment[]): { positive: number; neutral: number; negative: number } => {
  // This would use actual NLP sentiment analysis in a real implementation
  // Return default values since we don't have real data yet
  return { positive: 0, neutral: 0, negative: 0 };
};

// Generate content ideas based on comments (mock implementation)
export const generateContentOpportunities = (comments: Comment[]): any[] => {
  // This would use ML/NLP to analyze content gaps and opportunities in a real implementation
  // Return empty array since we don't have real data yet
  return [];
};
