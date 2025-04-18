
import { Comment } from '../types/api-types';
import { mockComments } from '../mock/comments-data';

export const fetchVideoComments = async (accessToken: string, videoId: string): Promise<Comment[]> => {
  console.log(`Fetch comments called for video ${videoId}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockComments;
};
