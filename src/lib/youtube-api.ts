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

// Mock videos for fallback
const MOCK_VIDEOS: Video[] = [
  {
    id: "mock1",
    title: "Getting Started with React",
    description: "Learn the basics of React development",
    thumbnail: "https://i.imgur.com/JvYeG1Z.jpg", 
    publishDate: new Date().toISOString(),
    viewCount: 1254,
    likeCount: 87,
    commentCount: 12
  },
  {
    id: "mock2", 
    title: "Advanced TypeScript Patterns",
    description: "Master TypeScript with these advanced patterns",
    thumbnail: "https://i.imgur.com/Nbgends.jpg",
    publishDate: new Date().toISOString(),
    viewCount: 843,
    likeCount: 64,
    commentCount: 9
  },
  {
    id: "mock3",
    title: "Building a Full-Stack App",
    description: "Complete guide to building full stack applications",
    thumbnail: "https://i.imgur.com/6Hlfxkg.jpg",
    publishDate: new Date().toISOString(),
    viewCount: 2152,
    likeCount: 143,
    commentCount: 27
  }
];

// Function to fetch videos from the user's channel
export const fetchChannelVideos = async (accessToken: string): Promise<Video[]> => {
  try {
    console.log("fetchChannelVideos called with token length:", accessToken?.length);
    
    // First check if we can access the gapi client
    if (!window.gapi || !window.gapi.client) {
      console.error('GAPI client not available');
      console.log('Returning mock videos due to missing GAPI client');
      return MOCK_VIDEOS;
    }
    
    if (!accessToken) {
      console.error('No access token provided');
      console.log('Returning mock videos due to missing access token');
      return MOCK_VIDEOS;
    }
    
    // Try to fetch real videos, but have mock videos as fallback
    try {
      console.log('Setting up YouTube API with token...');
      
      // Set up the API with the provided access token
      window.gapi.client.setApiKey('');
      window.gapi.client.setToken({ access_token: accessToken });
      
      // Force load YouTube API explicitly
      return new Promise<Video[]>((resolve, reject) => {
        // Ensure YouTube API is available
        if (!window.gapi.client.youtube) {
          console.log('YouTube API not initialized, loading explicitly...');
          
          window.gapi.client.load('youtube', 'v3')
            .then(() => {
              console.log('YouTube API loaded explicitly, proceeding with fetch');
              // Reset token after initialization
              window.gapi.client.setToken({ access_token: accessToken });
              
              fetchVideosAfterInit(accessToken)
                .then(videos => {
                  if (videos && videos.length > 0) {
                    resolve(videos);
                  } else {
                    console.log('No real videos found, returning mock videos');
                    resolve(MOCK_VIDEOS);
                  }
                })
                .catch(err => {
                  console.error('Error fetching videos after API init:', err);
                  console.log('Returning mock videos due to fetch error');
                  resolve(MOCK_VIDEOS);
                });
            })
            .catch(err => {
              console.error('Error loading YouTube API:', err);
              console.log('Returning mock videos due to API loading error');
              resolve(MOCK_VIDEOS);
            });
        } else {
          console.log('YouTube API already initialized, proceeding with fetch');
          // API already initialized, fetch directly
          fetchVideosAfterInit(accessToken)
            .then(videos => {
              if (videos && videos.length > 0) {
                resolve(videos);
              } else {
                console.log('No real videos found, returning mock videos');
                resolve(MOCK_VIDEOS);
              }
            })
            .catch(err => {
              console.error('Error fetching videos directly:', err);
              console.log('Returning mock videos due to direct fetch error');
              resolve(MOCK_VIDEOS);
            });
        }
      });
    } catch (apiError) {
      console.error("Error in YouTube API setup:", apiError);
      console.log("Returning mock videos due to API setup error");
      return MOCK_VIDEOS;
    }
  } catch (error) {
    console.error('Error in fetchChannelVideos:', error);
    console.log('Returning mock videos due to general error');
    return MOCK_VIDEOS;
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
    
    if (!playlistItemsResponse.result || !playlistItemsResponse.result.items) {
      console.error('No videos found in the uploads playlist');
      return [];
    }
    
    const videoIds = playlistItemsResponse.result.items.map(item => 
      item.contentDetails.videoId
    );
    
    if (videoIds.length === 0) {
      console.log('No videos found on this channel');
      return [];
    }
    
    // Get detailed info for each video
    const videosResponse = await window.gapi.client.youtube.videos.list({
      part: 'snippet,statistics',
      id: videoIds.join(',')
    });
    
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
  // For now, returning mock data for UI development purposes
  
  // Generate a consistent set of mock comments based on the video ID
  const seed = videoId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const mockCount = (seed % 10) + 5; // 5-15 comments
  
  // Generate mock comments
  const mockComments: Comment[] = Array.from({ length: mockCount }, (_, i) => {
    const isQuestion = (seed + i) % 5 === 0;
    const isComplaint = (seed + i) % 7 === 0;
    const priorityScore = isQuestion || isComplaint ? 0.8 : Math.random();
    
    return {
      id: `comment-${videoId}-${i}`,
      authorName: `Viewer ${i + 1}`,
      authorProfileImageUrl: `https://i.pravatar.cc/150?u=${videoId}-${i}`,
      text: generateMockCommentText(i, isQuestion, isComplaint),
      likeCount: Math.floor(Math.random() * 50),
      publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000)).toISOString(),
      isPriority: priorityScore > 0.7,
      isQuestion,
      isComplaint
    };
  });
  
  return new Promise(resolve => {
    // Simulate API delay
    setTimeout(() => resolve(mockComments), 1000);
  });
};

// Helper function to generate mock comment text
const generateMockCommentText = (index: number, isQuestion: boolean, isComplaint: boolean): string => {
  if (isQuestion) {
    const questions = [
      "Could you explain how you achieved that effect at 2:45?",
      "When will you post a follow-up video on this topic?",
      "What equipment do you use for recording?",
      "Have you considered doing a collaboration with other creators?",
      "Can you share more resources about this in the description?",
      "Will you be covering the advanced techniques in a future video?",
      "How long did it take you to master this skill?",
      "Is there a way to do this on a budget?"
    ];
    return questions[index % questions.length];
  }
  
  if (isComplaint) {
    const complaints = [
      "The audio was too low in some parts of the video.",
      "I found the pacing a bit too fast to follow along.",
      "There were some factual errors around the 5-minute mark.",
      "The lighting makes it hard to see the details.",
      "You didn't address the common problems people face with this.",
      "The video ended abruptly without a proper conclusion."
    ];
    return complaints[index % complaints.length];
  }
  
  const positiveComments = [
    "Great video! Very helpful and well-explained.",
    "I've been following your channel for years, and this is your best work yet!",
    "Thanks for sharing your knowledge, it helped me solve a problem I've had for months.",
    "The production quality keeps getting better with each video.",
    "I implemented your suggestions and saw immediate results.",
    "Your enthusiasm is contagious! Keep up the great content.",
    "I've shared this with my colleagues, we all found it very insightful.",
    "The visual examples really helped clarify the concepts.",
    "Your videos are always so well-researched and thorough.",
    "This is exactly what I needed to learn today. Perfect timing!"
  ];
  
  return positiveComments[index % positiveComments.length];
};

// Analyze sentiment of comments (mock implementation)
export const analyzeSentiment = (comments: Comment[]): { positive: number; neutral: number; negative: number } => {
  // This would use actual NLP sentiment analysis in a real implementation
  // For mock purposes, we'll use the comment properties to simulate sentiment
  
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  
  comments.forEach(comment => {
    if (comment.isComplaint) {
      negativeCount++;
    } else if (comment.isQuestion) {
      neutralCount++;
    } else {
      // Determine sentiment based on patterns in the text and like count
      const text = comment.text.toLowerCase();
      if (
        text.includes('great') || 
        text.includes('amazing') || 
        text.includes('good') || 
        text.includes('love') ||
        text.includes('helpful') ||
        text.includes('thanks')
      ) {
        positiveCount++;
      } else if (
        text.includes('bad') || 
        text.includes('terrible') || 
        text.includes('waste') ||
        text.includes('disappointing')
      ) {
        negativeCount++;
      } else {
        neutralCount++;
      }
    }
  });
  
  const total = comments.length || 1; // Avoid division by zero
  
  // Ensure there's always some sentiment distribution
  if (total === 0 || (positiveCount === 0 && neutralCount === 0 && negativeCount === 0)) {
    return { positive: 65, neutral: 25, negative: 10 };
  }
  
  // Calculate percentages
  return {
    positive: Math.round((positiveCount / total) * 100),
    neutral: Math.round((neutralCount / total) * 100),
    negative: Math.round((negativeCount / total) * 100)
  };
};

// Generate content ideas based on comments (mock implementation)
export const generateContentOpportunities = (comments: Comment[]): any[] => {
  // This would use ML/NLP to analyze content gaps and opportunities in a real implementation
  // For now, we'll generate mock content ideas based on questions and patterns
  
  const questionTopics = new Map<string, number>();
  
  // Extract topics from questions
  comments.filter(c => c.isQuestion).forEach(comment => {
    const text = comment.text.toLowerCase();
    
    if (text.includes('equipment') || text.includes('gear') || text.includes('camera')) {
      questionTopics.set('equipment', (questionTopics.get('equipment') || 0) + 1);
    }
    
    if (text.includes('tutorial') || text.includes('how to') || text.includes('guide')) {
      questionTopics.set('tutorials', (questionTopics.get('tutorials') || 0) + 1);
    }
    
    if (text.includes('collaborate') || text.includes('collaboration')) {
      questionTopics.set('collaborations', (questionTopics.get('collaborations') || 0) + 1);
    }
    
    if (text.includes('budget') || text.includes('cost') || text.includes('cheap') || text.includes('free')) {
      questionTopics.set('budget-friendly', (questionTopics.get('budget-friendly') || 0) + 1);
    }
    
    if (text.includes('advanced') || text.includes('expert') || text.includes('professional')) {
      questionTopics.set('advanced-techniques', (questionTopics.get('advanced-techniques') || 0) + 1);
    }
  });
  
  // Generate opportunities based on frequency
  const opportunities = Array.from(questionTopics.entries())
    .map(([topic, count]) => {
      const titleMap: Record<string, string> = {
        'equipment': 'Equipment Breakdown Video',
        'tutorials': 'Beginner-Friendly Tutorial Series',
        'collaborations': 'Collaboration with Other Creators',
        'budget-friendly': 'Budget-Friendly Alternatives Guide',
        'advanced-techniques': 'Advanced Techniques Masterclass'
      };
      
      const descriptionMap: Record<string, string> = {
        'equipment': 'Several viewers have asked about your equipment setup. A detailed breakdown video would be well-received.',
        'tutorials': "There is demand for more step-by-step tutorials for beginners in this topic area.",
        'collaborations': 'Your audience is interested in seeing you collaborate with other creators in this space.',
        'budget-friendly': 'Many viewers are looking for more affordable ways to achieve similar results.',
        'advanced-techniques': 'Your advanced viewers want more in-depth content that goes beyond the basics.'
      };
      
      return {
        id: `opportunity-${topic}`,
        title: titleMap[topic] || `Content about ${topic}`,
        description: descriptionMap[topic] || `Based on viewer comments, content about ${topic} would be well-received.`,
        requestCount: count,
        confidenceScore: Math.min(count * 10 + 50, 95) // 50-95% confidence based on frequency
      };
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore);
  
  // Add some general opportunities if we don't have many from questions
  if (opportunities.length < 3) {
    const generalOpportunities = [
      {
        id: 'opportunity-faq',
        title: 'Frequently Asked Questions Video',
        description: 'A dedicated FAQ video addressing the most common questions would save you time and help your viewers.',
        requestCount: 1,
        confidenceScore: 75
      },
      {
        id: 'opportunity-series',
        title: 'Create a Structured Series',
        description: 'Your one-off videos are popular. Consider creating a structured series to build a more dedicated audience.',
        requestCount: 1,
        confidenceScore: 70
      },
      {
        id: 'opportunity-behind-scenes',
        title: 'Behind-the-Scenes Content',
        description: 'Viewers often connect more with creators who share their process and personality.',
        requestCount: 1,
        confidenceScore: 65
      }
    ];
    
    // Add enough general opportunities to have at least 3 total
    for (let i = 0; i < Math.min(3 - opportunities.length, generalOpportunities.length); i++) {
      opportunities.push(generalOpportunities[i]);
    }
  }
  
  return opportunities;
};
