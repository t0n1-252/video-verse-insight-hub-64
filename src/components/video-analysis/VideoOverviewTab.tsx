
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SentimentChart from "@/components/SentimentChart";
import CommentList from "@/components/CommentList";
import { Comment as UiComment } from "@/components/CommentList";
import VideoInfo from "./VideoInfo";
import PriorityActions from "./PriorityActions";

interface VideoOverviewTabProps {
  video: {
    publishDate: string;
    views: number;
    commentCount: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  priorityComments: UiComment[];
  onViewAllComments: () => void;
}

const VideoOverviewTab = ({ video, sentiment, priorityComments, onViewAllComments }: VideoOverviewTabProps) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VideoInfo 
          publishDate={video.publishDate}
          views={video.views}
          comments={video.commentCount}
        />
        
        <Card className="md:col-span-1 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
            <CardDescription className="text-gray-400">
              Overall sentiment breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-400">Positive</span>
                <span>{sentiment.positive}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full" 
                  style={{ width: `${sentiment.positive}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-blue-400">Neutral</span>
                <span>{sentiment.neutral}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full" 
                  style={{ width: `${sentiment.neutral}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-red-400">Negative</span>
                <span>{sentiment.negative}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-400 h-2 rounded-full" 
                  style={{ width: `${sentiment.negative}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <PriorityActions
          questionsCount={2}
          complaintsCount={2}
          priorityCount={3}
        />
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Priority Comments</CardTitle>
          <CardDescription className="text-gray-400">
            Comments that need your attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CommentList comments={priorityComments} />
          <div className="text-center pt-4">
            <Button 
              variant="outline"
              onClick={onViewAllComments}
              className="w-full md:w-auto"
            >
              View All Comments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoOverviewTab;
