import { Comment } from '../types/api-types';

export const analyzeSentiment = async (comments: Comment[]): Promise<{ 
  positive: number; 
  neutral: number; 
  negative: number; 
}> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ comments }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze sentiment');
    }

    const result = await response.json();
    return {
      positive: result.positive || 0,
      neutral: result.neutral || 0,
      negative: result.negative || 0,
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { positive: 0, neutral: 0, negative: 0 };
  }
};

export const generateContentOpportunities = (comments: Comment[]): any[] => {
  return [];
};
