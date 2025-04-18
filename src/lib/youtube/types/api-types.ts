
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
