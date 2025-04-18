
import { Comment } from '../types/api-types';

export const fetchVideoComments = async (accessToken: string, videoId: string): Promise<Comment[]> => {
  console.log(`Fetch comments called for video ${videoId}`);
  return [];
};
