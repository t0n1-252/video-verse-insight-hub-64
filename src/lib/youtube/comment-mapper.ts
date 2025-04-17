
import { Comment as ApiComment } from '../youtube-api';
import { Comment as UiComment } from '@/components/CommentList';

/**
 * Maps a YouTube API comment to the format expected by the UI components
 */
export const mapApiCommentToUiComment = (comment: ApiComment): UiComment => {
  return {
    id: comment.id,
    author: comment.authorName,
    profilePic: comment.authorProfileImageUrl,
    text: comment.text,
    likes: comment.likeCount,
    timestamp: new Date(comment.publishedAt).toLocaleString(),
    // Derive sentiment from the comment properties
    sentiment: comment.isComplaint ? 'negative' : (comment.isQuestion ? 'neutral' : 'positive'),
    isQuestion: comment.isQuestion,
    isComplaint: comment.isComplaint,
    isPriority: comment.isPriority
  };
};

/**
 * Maps an array of YouTube API comments to UI comments
 */
export const mapApiCommentsToUiComments = (comments: ApiComment[]): UiComment[] => {
  return comments.map(mapApiCommentToUiComment);
};
