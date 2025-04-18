
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Calendar, Eye, MessageSquare } from "lucide-react";
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

interface VideoAnalysisProps {
  video?: Video;
}

const VideoAnalysis = ({ video: propVideo }: VideoAnalysisProps) => {
  const { videoId } = useParams();
  const [video, setVideo] = useState<Video | null>(propVideo || null);
  const [activeTab, setActiveTab] = useState("overview");
  const [apiComments, setApiComments] = useState<ApiComment[]>([]);
  const [comments, setComments] = useState<UiComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState({ positive: 65, neutral: 25, negative: 10 });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const { accessToken } = useYouTubeAuth();

  useEffect(() => {
    if (propVideo) {
      setVideo(propVideo);
    } else if (videoId) {
      console.log("Would fetch video details for:", videoId);
    }
  }, [videoId, propVideo]);

  const loadComments = async () => {
    try {
      const commentsData = mockComments;
      setApiComments(commentsData);
      
      const uiComments = mapApiCommentsToUiComments(commentsData);
      setComments(uiComments);
      
      const sentimentData = { positive: 65, neutral: 25, negative: 10 };
      setSentiment(sentimentData);
      
      setOpportunities([]);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ThreeDotsFade color="#3b82f6" height={40} />
        <p className="mt-4 text-gray-400">Loading video details...</p>
      </div>
    );
  }

  const priorityComments = comments.filter(comment => comment.isPriority);
  const questions = comments.filter(comment => comment.isQuestion);
  const complaints = comments.filter(comment => comment.isComplaint);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <ArrowLeft className="mr-2 cursor-pointer text-gray-400 hover:text-gray-200" onClick={() => window.history.back()} />
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
          <TabsTrigger value="comments" className="data-[state=active]:bg-gray-700">
            All Comments
            <Badge variant="secondary" className="ml-2 bg-gray-700">{comments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-gray-700">
            Questions
            <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-400">{questions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="complaints" className="data-[state=active]:bg-gray-700">
            Complaints
            <Badge variant="secondary" className="ml-2 bg-amber-500/20 text-amber-400">{complaints.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-gray-700">
            Content Opportunities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <VideoOverviewTab 
            video={{
              publishDate: video.publishDate,
              views: video.viewCount,
              commentCount: video.commentCount
            }}
            sentiment={sentiment}
            priorityComments={priorityComments}
            onViewAllComments={() => setActiveTab("comments")}
          />
        </TabsContent>

        <TabsContent value="comments">
          <CommentList comments={comments} />
        </TabsContent>

        <TabsContent value="questions">
          <CommentList comments={questions} />
        </TabsContent>

        <TabsContent value="complaints">
          <CommentList comments={complaints} />
        </TabsContent>

        <TabsContent value="opportunities">
          <ContentOpportunities opportunities={opportunities} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoAnalysis;
