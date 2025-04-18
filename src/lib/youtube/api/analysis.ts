
import { Comment } from '../types/api-types';

export const analyzeSentiment = async (comments: Comment[]) => {
  // Mock sentiment analysis
  return {
    positive: 65,
    neutral: 25,
    negative: 10
  };
};

export const generateContentOpportunities = (comments: Comment[]) => {
  // Mock content opportunities
  return [
    {
      id: '1',
      title: 'Morning Routine Video',
      description: 'Multiple users have requested content about morning routines and habits.',
      requestCount: 15,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Workplace Anxiety Management',
      description: 'Several comments ask about managing anxiety in professional settings.',
      requestCount: 8,
      priority: 'medium'
    }
  ];
};
