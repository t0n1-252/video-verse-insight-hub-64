import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThreeDotsFade } from "react-svg-spinners";
import CommentList from "@/components/CommentList";
import ContentOpportunities from "@/components/ContentOpportunities";
import VideoOverviewTab from "@/components/video-analysis/VideoOverviewTab";
import VideoInfoCards from "@/components/video-analysis/VideoInfoCards";
import { useYouTubeAuth } from "@/lib/youtube-auth";
import { Video, Comment as ApiComment, fetchVideoComments, analyzeSentiment, generateContentOpportunities } from "@/lib/youtube-api";
import { mapApiCommentsToUiComments } from "@/lib/youtube/comment-mapper";

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
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const commentsData = await fetchVideoComments(accessToken, video.id);
      setApiComments(commentsData);
      
      const uiComments = mapApiCommentsToUiComments(commentsData);
      setComments(uiComments);
      
      const sentimentData = analyzeSentiment(commentsData);
      setSentiment(sentimentData);
      
      const opportunitiesData = generateContentOpportunities(commentsData);
      setOpportunities(opportunitiesData);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
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
      <div className="flex items-center mb-6">
        <ArrowLeft className="mr-2 cursor-pointer" onClick={() => window.history.back()} />
        <h2 className="text-2xl font-bold">{video.title}</h2>
      </div>

      <VideoInfoCards 
        questionsCount={questions.length}
        complaintsCount={complaints.length}
        opportunitiesCount={opportunities.length}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ThreeDotsFade color="#3b82f6" height={40} />
          <p className="mt-4 text-gray-400">Analyzing comments...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-gray-700">All Comments</TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-gray-700">
              Questions
              <Badge className="ml-2 bg-blue-500">{questions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="complaints" className="data-[state=active]:bg-gray-700">
              Complaints
              <Badge className="ml-2 bg-amber-500">{complaints.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-gray-700">
              Content Opportunities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <VideoOverviewTab 
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
      )}
    </div>
  );
};

export default VideoAnalysis;
