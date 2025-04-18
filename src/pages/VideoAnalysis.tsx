
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Calendar, Eye, MessageSquare, Flag, ThumbsUp, Activity, HelpCircle, AlertCircle, Flame, CircleDot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThreeDotsFade } from "react-svg-spinners";
import CommentList, { Comment as UiComment } from "@/components/CommentList";
import ContentOpportunities from "@/components/ContentOpportunities";
import VideoOverviewTab from "@/components/video-analysis/VideoOverviewTab";
import VideoInfoCards from "@/components/video-analysis/VideoInfoCards";
import { useYouTubeAuth } from "@/lib/youtube-auth";
import { Video, Comment as ApiComment, fetchVideoComments, analyzeSentiment, generateContentOpportunities } from "@/lib/youtube-api";
import { mapApiCommentsToUiComments } from "@/lib/youtube/comment-mapper";
import { mockComments } from "@/lib/youtube/mock/comments-data";

const MOCK_VIDEOS = [
  {
    id: "video1",
    title: "How to Build a React App in 10 Minutes",
    thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop",
    publishDate: "2023-12-15",
    viewCount: 45231,
    commentCount: 378,
    likeCount: 2134,
    description: "A quick tutorial on building React applications"
  },
  {
    id: "video2",
    title: "Advanced TypeScript Tips for Developers",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",
    publishDate: "2024-01-22",
    viewCount: 32182,
    commentCount: 256,
    likeCount: 1872,
    description: "Learn advanced TypeScript features"
  },
  {
    id: "video3",
    title: "Creating Custom Hooks in React",
    thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop",
    publishDate: "2024-02-05",
    viewCount: 28933,
    commentCount: 194,
    likeCount: 1543,
    description: "Improve your React code with custom hooks"
  },
  {
    id: "video4",
    title: "State Management with Redux Toolkit",
    thumbnail: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
    publishDate: "2024-03-10",
    viewCount: 19845,
    commentCount: 132,
    likeCount: 876,
    description: "Simplify state management with Redux Toolkit"
  }
];

interface VideoAnalysisProps {
  video?: Video;
}

const VideoAnalysis = ({ video: propVideo }: VideoAnalysisProps) => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(propVideo || null);
  const [activeTab, setActiveTab] = useState("overview");
  const [apiComments, setApiComments] = useState<ApiComment[]>([]);
  const [comments, setComments] = useState<UiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState({ positive: 65, neutral: 25, negative: 10 });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const { accessToken } = useYouTubeAuth();

  useEffect(() => {
    setTimeout(() => {
      if (propVideo) {
        setVideo(propVideo);
        setLoading(false);
      } else if (videoId) {
        const foundVideo = MOCK_VIDEOS.find(v => v.id === videoId);
        if (foundVideo) {
          setVideo(foundVideo as Video);
          const uiComments = mapApiCommentsToUiComments(mockComments);
          setComments(uiComments);
          setLoading(false);
        } else {
          console.log("Video not found:", videoId);
          setLoading(false);
        }
      }
    }, 500);
  }, [videoId, propVideo]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ThreeDotsFade color="#3b82f6" height={40} />
        <p className="mt-4 text-gray-400">Loading video details...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400">Video not found.</p>
        <button 
          onClick={goBack}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );
  }

  const priorityComments = comments.filter(comment => comment.isPriority);
  const hotLeads = comments.filter(comment => comment.isPriority && comment.isQuestion);
  const mostLiked = [...comments].sort((a, b) => b.likes - a.likes).slice(0, 10);
  const mostEngaged = [...comments].sort((a, b) => b.likes - a.likes).slice(0, 10);
  const questions = comments.filter(comment => comment.isQuestion);
  const testimonials = comments.filter(comment => !comment.isComplaint && !comment.isQuestion && comment.sentiment === 'positive');
  const complaints = comments.filter(comment => comment.isComplaint);
  const neutral = comments.filter(comment => comment.sentiment === 'neutral');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <ArrowLeft className="mr-2 cursor-pointer text-gray-400 hover:text-gray-200" onClick={goBack} />
          <h2 className="text-2xl font-bold text-gray-100">{video.title}</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400 ml-8">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{new Date(video.publishDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={16} />
            <span>{video.viewCount.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            <span>{video.commentCount.toLocaleString()} comments</span>
          </div>
        </div>
      </div>

      <VideoOverviewTab 
        video={{
          publishDate: video.publishDate,
          views: video.viewCount,
          commentCount: video.commentCount
        }}
        sentiment={sentiment}
        priorityComments={priorityComments}
        onViewAllComments={() => {}}
      />

      <Tabs defaultValue="priority" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="priority" className="data-[state=active]:bg-gray-700">
            <Flag className="w-4 h-4 mr-2" />
            Priority Comments
            <Badge variant="secondary" className="ml-2 bg-purple-500/30 text-purple-200">{priorityComments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="hot-leads" className="data-[state=active]:bg-gray-700">
            <Flame className="w-4 h-4 mr-2" />
            Hot Leads
            <Badge variant="secondary" className="ml-2 bg-red-500/30 text-red-200">{hotLeads.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="most-liked" className="data-[state=active]:bg-gray-700">
            <ThumbsUp className="w-4 h-4 mr-2" />
            Most Liked
            <Badge variant="secondary" className="ml-2 bg-blue-500/30 text-blue-200">{mostLiked.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="most-engaged" className="data-[state=active]:bg-gray-700">
            <Activity className="w-4 h-4 mr-2" />
            Most Engagement
            <Badge variant="secondary" className="ml-2 bg-amber-500/30 text-amber-200">{mostEngaged.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-gray-700">
            <HelpCircle className="w-4 h-4 mr-2" />
            Questions
            <Badge variant="secondary" className="ml-2 bg-blue-500/30 text-blue-200">{questions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="data-[state=active]:bg-gray-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Testimonials
            <Badge variant="secondary" className="ml-2 bg-green-500/30 text-green-200">{testimonials.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="complaints" className="data-[state=active]:bg-gray-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            Complaints
            <Badge variant="secondary" className="ml-2 bg-amber-500/30 text-amber-200">{complaints.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="neutral" className="data-[state=active]:bg-gray-700">
            <CircleDot className="w-4 h-4 mr-2" />
            Neutral
            <Badge variant="secondary" className="ml-2 bg-gray-500/30 text-gray-200">{neutral.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="priority">
          <CommentList comments={priorityComments} />
        </TabsContent>

        <TabsContent value="hot-leads">
          <CommentList comments={hotLeads} />
        </TabsContent>

        <TabsContent value="most-liked">
          <CommentList comments={mostLiked} />
        </TabsContent>

        <TabsContent value="most-engaged">
          <CommentList comments={mostEngaged} />
        </TabsContent>

        <TabsContent value="questions">
          <CommentList comments={questions} />
        </TabsContent>

        <TabsContent value="testimonials">
          <CommentList comments={testimonials} />
        </TabsContent>

        <TabsContent value="complaints">
          <CommentList comments={complaints} />
        </TabsContent>

        <TabsContent value="neutral">
          <CommentList comments={neutral} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoAnalysis;
