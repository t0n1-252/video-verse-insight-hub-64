
export type YouTubeAPIErrorType = 
  | 'AUTH_ERROR'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'CHANNEL_NOT_FOUND'
  | 'NO_VIDEOS_FOUND';

export interface YouTubeAPIError {
  type: YouTubeAPIErrorType;
  message: string;
  originalError?: unknown;
}

export class YouTubeError extends Error {
  constructor(
    public type: YouTubeAPIErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'YouTubeError';
  }
}
