
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, AlertCircle, HelpCircle, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import SentimentChart from "@/components/SentimentChart";
import CommentList, { Comment } from "@/components/CommentList";
import ContentOpportunities from "@/components/ContentOpportunities";

// Mock data for sentiment analysis
const MOCK_SENTIMENT = {
  positive: 65,
  neutral: 25,
  negative: 10
};

// Mock data for comments
const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "TechEnthusiast",
    profilePic: "https://i.pravatar.cc/150?img=1",
    text: "This tutorial was incredibly helpful! I've been struggling with React hooks for weeks and your explanation finally made it click for me.",
    likes: 45,
    timestamp: "2 days ago",
    sentiment: "positive",
    isQuestion: false,
    isComplaint: false,
    isPriority: false,
  },
  {
    id: "c2",
    author: "CodeNewbie",
    profilePic: "https://i.pravatar.cc/150?img=2",
    text: "Could you explain how this would work with TypeScript? I'm having trouble implementing it in my TS project.",
    likes: 23,
    timestamp: "1 day ago",
    sentiment: "neutral",
    isQuestion: true,
    isComplaint: false,
    isPriority: true,
  },
  {
    id: "c3",
    author: "FrustatedDev",
    profilePic: "https://i.pravatar.cc/150?img=3",
    text: "I followed your tutorial exactly and got 3 errors. Your example is missing a lot of crucial setup steps that would be necessary for beginners.",
    likes: 8,
    timestamp: "3 days ago",
    sentiment: "negative",
    isQuestion: false,
    isComplaint: true,
    isPriority: true,
  },
  {
    id: "c4",
    author: "ReactMaster",
    profilePic: "https://i.pravatar.cc/150?img=4", 
    text: "Have you considered doing a follow-up video on performance optimization for these patterns? I think it would be really valuable.",
    likes: 32,
    timestamp: "12 hours ago",
    sentiment: "neutral",
    isQuestion: true,
    isComplaint: false,
    isPriority: true,
  },
  {
    id: "c5",
    author: "CodingJourney",
    profilePic: "https://i.pravatar.cc/150?img=5",
    text: "Your explanation on hooks was perfect, but I still don't understand context API very well. Can you cover that topic in your next video?",
    likes: 19,
    timestamp: "2 days ago",
    sentiment: "positive",
    isQuestion: true,
    isComplaint: false,
    isPriority: false,
  },
];

// Mock content opportunities
const MOCK_OPPORTUNITIES = [
  {
    id: "opp1",
    title: "TypeScript Integration with React Hooks",
    description: "Many viewers are struggling with TypeScript implementation. A dedicated video would help them.",
    relevantComments: 24,
    confidence: 87,
  },
  {
    id: "opp2",
    title: "Common Setup Errors and Solutions",
    description: "Address the frequent errors viewers encounter when following your tutorials.",
    relevantComments: 18,
    confidence: 72,
  },
  {
    id: "opp3",
    title: "Deep Dive into React Context API",
    description: "Viewers want more clarity on Context API usage and best practices.",
    relevantComments: 15,
    confidence: 68,
  },
];

interface VideoAnalysisProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    publishDate: string;
    viewCount: string;
    commentCount: number;
  };
}

const VideoAnalysis = ({ video }: VideoAnalysisProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Filter priority comments (questions or complaints)
  const priorityComments = MOCK_COMMENTS.filter(comment => comment.isPriority);
  const questions = MOCK_COMMENTS.filter(comment => comment.isQuestion);
  const complaints = MOCK_COMMENTS.filter(comment => comment.isComplaint);

  // Get overall sentiment
  const getOverallSentiment = () => {
    if (MOCK_SENTIMENT.positive > 60) return "Mostly Positive";
    if (MOCK_SENTIMENT.negative > 40) return "Concerning";
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
                <span className="text-gray-100">{video.publishDate}</span>
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
                  <span>{MOCK_SENTIMENT.positive}%</span>
                </div>
                <Progress value={MOCK_SENTIMENT.positive} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-blue-400">Neutral</span>
                  <span>{MOCK_SENTIMENT.neutral}%</span>
                </div>
                <Progress 
                  value={MOCK_SENTIMENT.neutral} 
                  className="h-2"
                  style={{ "--progress-color": "hsl(var(--blue-400))" } as React.CSSProperties}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-red-400">Negative</span>
                  <span>{MOCK_SENTIMENT.negative}%</span>
                </div>
                <Progress 
                  value={MOCK_SENTIMENT.negative} 
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
                  <p className="text-gray-100">{MOCK_OPPORTUNITIES.length} content ideas</p>
                  <p className="text-xs text-gray-400">Based on comments</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  positive={MOCK_SENTIMENT.positive} 
                  neutral={MOCK_SENTIMENT.neutral} 
                  negative={MOCK_SENTIMENT.negative} 
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Priority Comments</h3>
            <CommentList comments={priorityComments} />
            
            <div className="text-center pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                View All Comments
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <CommentList comments={MOCK_COMMENTS} />
        </TabsContent>

        <TabsContent value="questions">
          <CommentList comments={questions} />
        </TabsContent>

        <TabsContent value="complaints">
          <CommentList comments={complaints} />
        </TabsContent>

        <TabsContent value="opportunities">
          <ContentOpportunities opportunities={MOCK_OPPORTUNITIES} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoAnalysis;
