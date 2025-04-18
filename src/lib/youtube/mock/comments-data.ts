
import { Comment } from '../types/api-types';

export const mockComments: Comment[] = [
  {
    id: '1',
    authorName: 'Alice Johnson',
    authorProfileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    text: 'Great video! I especially loved the part about mindfulness techniques. Could you make a follow-up video about morning routines?',
    likeCount: 245,
    publishedAt: '2024-04-15T10:30:00Z',
    updatedAt: '2024-04-15T10:30:00Z',
    isPriority: true,
    isQuestion: true,
    isComplaint: false
  },
  {
    id: '2',
    authorName: 'Marcus Chen',
    authorProfileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    text: 'The audio quality in this video is not great, it was hard to hear some parts.',
    likeCount: 89,
    publishedAt: '2024-04-14T15:20:00Z',
    updatedAt: '2024-04-14T15:20:00Z',
    isPriority: true,
    isQuestion: false,
    isComplaint: true
  },
  {
    id: '3',
    authorName: 'Sarah Smith',
    authorProfileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    text: 'This content really helped me understand anxiety better. Thank you for sharing your expertise!',
    likeCount: 567,
    publishedAt: '2024-04-14T08:15:00Z',
    updatedAt: '2024-04-14T08:15:00Z',
    isPriority: true,
    isQuestion: false,
    isComplaint: false
  },
  {
    id: '4',
    authorName: 'David Wilson',
    authorProfileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    text: 'How do you recommend dealing with panic attacks at work? Any specific techniques?',
    likeCount: 156,
    publishedAt: '2024-04-13T22:45:00Z',
    updatedAt: '2024-04-13T22:45:00Z',
    isPriority: false,
    isQuestion: true,
    isComplaint: false
  },
  {
    id: '5',
    authorName: 'Emily Rodriguez',
    authorProfileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    text: 'The background music was too loud and distracting from the main content.',
    likeCount: 34,
    publishedAt: '2024-04-13T19:10:00Z',
    updatedAt: '2024-04-13T19:10:00Z',
    isPriority: false,
    isQuestion: false,
    isComplaint: true
  }
];
