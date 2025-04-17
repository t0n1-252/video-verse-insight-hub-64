
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, AlertCircle, HelpCircle, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import SentimentChart from "@/components/SentimentChart";
import CommentList from "@/components/CommentList";
import ContentOpportunities from "@/components/ContentOpportunities";
import { useYouTubeAuth } from "@/lib/youtube-auth";
import { Video, Comment, fetchVideoComments, analyzeSentiment, generateContentOpportunities } from "@/lib/youtube-api";
import { ThreeDotsFade } from "react-svg-spinners";

interface VideoAnalysisProps {
  video: Video;
}

const VideoAnalysis = ({ video }: VideoAnalysisProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState({ positive: 65, neutral: 25, negative: 10 });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const { accessToken } = useYouTubeAuth();

  useEffect(() => {
    if (accessToken && video.id) {
      loadComments();
    }
  }, [accessToken, video.id]);

  const loadComments = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const commentsData = await fetchVideoComments(accessToken, video.id);
      setComments(commentsData);
      
      // Calculate sentiment based on actual comments
      const sentimentData = analyzeSentiment(commentsData);
      setSentiment(sentimentData);
      
      // Generate content opportunities
      const opportunitiesData = generateContentOpportunities(commentsData);
      setOpportunities(opportunitiesData);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter priority comments (questions or complaints)
  const priorityComments = comments.filter(comment => comment.isPriority);
  const questions = comments.filter(comment => comment.isQuestion);
  const complaints = comments.filter(comment => comment.isComplaint);

  // Get overall sentiment
  const getOverallSentiment = () => {
    if (sentiment.positive > 60) return "Mostly Positive";
    if (sentiment.negative > 40) return "Concerning";
    return "Mixed";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <ArrowLeft className="mr-2 cursor-pointer" onClick={() => window.history.back()} />
        <h2 className="text-2xl font-bold">{video.title}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-md text-gray-100">Video Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Published:</span>
                <span className="text-gray-100">{new Date(video.publishDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Views:</span>
                <span className="text-gray-100">{video.viewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Comments:</span>
                <span className="text-gray-100">{video.commentCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-md text-gray-100">Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-2">
              <span className="text-2xl font-bold">{getOverallSentiment()}</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-green-400">Positive</span>
                  <span>{sentiment.positive}%</span>
                </div>
                <Progress value={sentiment.positive} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-blue-400">Neutral</span>
                  <span>{sentiment.neutral}%</span>
                </div>
                <Progress 
                  value={sentiment.neutral} 
                  className="h-2"
                  style={{ "--progress-color": "hsl(var(--blue-400))" } as React.CSSProperties}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-red-400">Negative</span>
                  <span>{sentiment.negative}%</span>
                </div>
                <Progress 
                  value={sentiment.negative} 
                  className="h-2"
                  style={{ "--progress-color": "hsl(var(--red-400))" } as React.CSSProperties}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-md text-gray-100">Priority Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <HelpCircle className="mr-2 text-blue-400" size={18} />
                <div>
                  <p className="text-gray-100">{questions.length} questions</p>
                  <p className="text-xs text-gray-400">Need your response</p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertCircle className="mr-2 text-amber-400" size={18} />
                <div>
                  <p className="text-gray-100">{complaints.length} complaints</p>
                  <p className="text-xs text-gray-400">May need addressing</p>
                </div>
              </div>
              <div className="flex items-center">
                <Lightbulb className="mr-2 text-purple-400" size={18} />
                <div>
                  <p className="text-gray-100">{opportunities.length} content ideas</p>
                  <p className="text-xs text-gray-400">Based on comments</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Sentiment Breakdown</CardTitle>
                  <CardDescription className="text-gray-400">Visual representation of comment sentiment</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <SentimentChart 
                    positive={sentiment.positive} 
                    neutral={sentiment.neutral} 
                    negative={sentiment.negative} 
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Priority Comments</h3>
              <CommentList comments={priorityComments} />
              
              <div className="text-center pt-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setActiveTab("comments")}
                >
                  View All Comments
                </Button>
              </div>
            </div>
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
