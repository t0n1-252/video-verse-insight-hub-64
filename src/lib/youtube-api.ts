
// YouTube API service functions

// Define interfaces for video types
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  publishDate: string;
  viewCount: string;
  commentCount: number;
  description?: string;
  likeCount?: string;
  duration?: string;
  channelId?: string;
  channelTitle?: string;
}

export interface Comment {
  id: string;
  author: string;
  profilePic: string;
  text: string;
  likes: number;
  timestamp: string;
  sentiment: "positive" | "neutral" | "negative";
  isQuestion: boolean;
  isComplaint: boolean;
  isPriority: boolean;
}

export interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ContentOpportunity {
  id: string;
  title: string;
  description: string;
  relevantComments: number;
  confidence: number;
}

// Fetch channel videos using the browser-compatible gapi client
export const fetchChannelVideos = async (accessToken: string): Promise<Video[]> => {
  try {
    // Validate inputs
    if (!accessToken) {
      throw new Error('No access token provided');
    }
    
    // Check if gapi is loaded
    if (!window.gapi || !window.gapi.client) {
      throw new Error('Google API client not loaded');
    }
    
    // Set the access token for this request
    window.gapi.client.setApiKey('');
    window.gapi.client.setToken({ access_token: accessToken });
    
    // Get the authenticated user's channel ID
    const channelResponse = await window.gapi.client.youtube.channels.list({
      part: 'id,snippet',
      mine: true
    });
    
    if (!channelResponse.result.items || channelResponse.result.items.length === 0) {
      console.log('No channel found for the authenticated user');
      return [];
    }
    
    const channelId = channelResponse.result.items[0].id;
    
    // Get videos from the user's channel
    const videosResponse = await window.gapi.client.youtube.search.list({
      part: 'snippet',
      channelId: channelId,
      maxResults: 50,
      order: 'date',
      type: 'video'
    });
    
    if (!videosResponse.result.items) {
      return [];
    }
    
    // Get additional video details (view counts, etc.)
    const videoIds = videosResponse.result.items
      .map(item => item.id?.videoId)
      .filter(Boolean);
      
    if (videoIds.length === 0) return [];
    
    const videoDetailsResponse = await window.gapi.client.youtube.videos.list({
      part: 'statistics,snippet,contentDetails',
      id: videoIds.join(',')
    });
    
    if (!videoDetailsResponse.result.items) {
      return [];
    }
    
    // Map the response to our Video interface
    return videoDetailsResponse.result.items.map(video => {
      const snippet = video.snippet || {};
      const statistics = video.statistics || {};
      const thumbnails = snippet.thumbnails || {};
      
      return {
        id: video.id || '',
        title: snippet.title || 'Untitled Video',
        thumbnail: thumbnails.high?.url || thumbnails.default?.url || '',
        publishDate: snippet.publishedAt || '',
        viewCount: statistics.viewCount || '0',
        commentCount: parseInt(statistics.commentCount || '0'),
        description: snippet.description || '',
        likeCount: statistics.likeCount || '0',
        channelId: snippet.channelId || '',
        channelTitle: snippet.channelTitle || '',
      };
    });
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    throw error;
  }
};

// Get video comments
export const fetchVideoComments = async (accessToken: string, videoId: string): Promise<Comment[]> => {
  try {
    // Set the access token for this request
    window.gapi.client.setApiKey('');
    window.gapi.client.setToken({ access_token: accessToken });
    
    const commentsResponse = await window.gapi.client.youtube.commentThreads.list({
      part: 'snippet,replies',
      videoId: videoId,
      maxResults: 100,
      order: 'relevance'
    });
    
    if (!commentsResponse.result.items) {
      return [];
    }
    
    // Map comments to our Comment interface with mock sentiment analysis
    // In a real app, you would use a proper sentiment analysis API or ML model
    return commentsResponse.result.items.map(item => {
      const snippet = item.snippet?.topLevelComment?.snippet;
      if (!snippet) return null;
      
      // Simplified mock sentiment analysis based on comment text
      const text = snippet.textDisplay || '';
      let sentiment: "positive" | "neutral" | "negative" = "neutral";
      const positiveWords = ["great", "awesome", "love", "excellent", "amazing", "thank", "good", "best"];
      const negativeWords = ["bad", "hate", "terrible", "awful", "worst", "sucks", "horrible", "disappointed"];
      
      const lowerText = text.toLowerCase();
      const hasPositive = positiveWords.some(word => lowerText.includes(word));
      const hasNegative = negativeWords.some(word => lowerText.includes(word));
      
      if (hasPositive && !hasNegative) sentiment = "positive";
      if (hasNegative && !hasPositive) sentiment = "negative";
      
      // Simple detection of questions and complaints
      const isQuestion = lowerText.includes("?") || 
                         lowerText.includes("how") || 
                         lowerText.includes("what") || 
                         lowerText.includes("when") || 
                         lowerText.includes("where") || 
                         lowerText.includes("why") || 
                         lowerText.includes("could you");
      
      const isComplaint = lowerText.includes("error") || 
                          lowerText.includes("problem") || 
                          lowerText.includes("doesn't work") || 
                          lowerText.includes("issue") || 
                          lowerText.includes("not working");
      
      // Priority comments are questions or complaints, especially negative ones
      const isPriority = (isQuestion || isComplaint) && (sentiment === "negative" || lowerText.length > 100);
      
      return {
        id: item.id || `comment-${Math.random().toString(36).substring(2, 11)}`,
        author: snippet.authorDisplayName || 'Anonymous',
        profilePic: snippet.authorProfileImageUrl || 'https://i.pravatar.cc/150',
        text: text,
        likes: Number(snippet.likeCount || '0'),
        timestamp: snippet.publishedAt || 'Unknown date',
        sentiment,
        isQuestion,
        isComplaint,
        isPriority,
      };
    }).filter(Boolean) as Comment[];
  } catch (error) {
    console.error('Error fetching video comments:', error);
    throw error;
  }
};

// Mock function for content opportunities
// In a real application, this would be powered by an ML model or more sophisticated analysis
export const generateContentOpportunities = (comments: Comment[]): ContentOpportunity[] => {
  // Group comments by themes and topics
  const topics = new Map<string, { count: number, keywords: string[], comments: Comment[] }>();
  
  // Simple keyword extraction (in a real app, use NLP)
  comments.forEach(comment => {
    const text = comment.text.toLowerCase();
    const words = text.split(/\W+/).filter(word => word.length > 3);
    
    // Skip very short comments
    if (words.length < 3) return;
    
    // Extract potential topics
    if (comment.isQuestion) {
      // Find the main subject of the question
      const questionWords = ["how", "what", "when", "where", "why", "can", "could", "would", "should"];
      for (let i = 0; i < words.length - 1; i++) {
        if (questionWords.includes(words[i])) {
          const potentialTopic = words.slice(i + 1, i + 4).join(" ");
          if (potentialTopic) {
            if (!topics.has(potentialTopic)) {
              topics.set(potentialTopic, { count: 0, keywords: [], comments: [] });
            }
            const topic = topics.get(potentialTopic)!;
            topic.count++;
            topic.comments.push(comment);
          }
          break;
        }
      }
    }
    
    // Look for requests or suggestions
    if (text.includes("please") || 
        text.includes("would like") || 
        text.includes("can you") || 
        text.includes("should make") || 
        text.includes("next video")) {
      const startIndex = Math.max(
        text.indexOf("please"),
        text.indexOf("would like"),
        text.indexOf("can you"),
        text.indexOf("should make"),
        text.indexOf("next video"),
      );
      
      if (startIndex > -1) {
        const slice = text.slice(startIndex, startIndex + 100);
        const potentialTopic = slice.split(/[.?!]/)[0];
        
        if (potentialTopic && potentialTopic.length > 10) {
          // Generate a cleaner title from the topic
          const cleanTopic = potentialTopic
            .replace(/(please|would like|can you|should make|next video)/g, '')
            .trim()
            .split(" ")
            .slice(0, 5)
            .join(" ");
          
          if (cleanTopic && cleanTopic.length > 5) {
            if (!topics.has(cleanTopic)) {
              topics.set(cleanTopic, { count: 0, keywords: [], comments: [] });
            }
            const topic = topics.get(cleanTopic)!;
            topic.count++;
            topic.comments.push(comment);
          }
        }
      }
    }
  });
  
  // Convert the map to an array of content opportunities
  return Array.from(topics.entries())
    .filter(([_, data]) => data.count >= 2) // Only topics mentioned multiple times
    .sort((a, b) => b[1].count - a[1].count) // Sort by popularity
    .slice(0, 5) // Take top 5
    .map(([topic, data], index) => {
      // Generate a more appealing title
      const title = topic.split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      
      // Calculate confidence based on comment count and sentiment
      const positiveComments = data.comments.filter(c => c.sentiment === "positive").length;
      const neutralComments = data.comments.filter(c => c.sentiment === "neutral").length;
      const relevantComments = data.count;
      
      // Higher confidence for topics with more mentions and positive sentiment
      const confidence = Math.min(
        100, 
        Math.round(
          (data.count * 10) + 
          (positiveComments * 5) + 
          (neutralComments * 2)
        )
      );
      
      return {
        id: `opp-${index + 1}`,
        title: title.length > 5 
          ? title 
          : `Content Idea #${index + 1}`,
        description: `Based on ${String(relevantComments)} viewer comments requesting content about ${topic}.`,
        relevantComments,
        confidence,
      };
    });
};

// Analyze comment sentiment
export const analyzeSentiment = (comments: Comment[]): SentimentAnalysis => {
  if (comments.length === 0) {
    return { positive: 0, neutral: 0, negative: 0 };
  }
  
  const positive = comments.filter(comment => comment.sentiment === "positive").length;
  const neutral = comments.filter(comment => comment.sentiment === "neutral").length;
  const negative = comments.filter(comment => comment.sentiment === "negative").length;
  
  const total = comments.length;
  
  return {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
  };
};
