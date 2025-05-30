
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SentimentChart from "@/components/SentimentChart";
import CommentList from "@/components/CommentList";
import { Comment as UiComment } from "@/components/CommentList";
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
  // Calculate counts for different comment categories
  const questionsCount = priorityComments.filter(c => c.isQuestion).length;
  const complaintsCount = priorityComments.filter(c => c.isComplaint).length;
  const positivesCount = priorityComments.filter(c => c.sentiment === 'positive').length;
  const neutralCount = priorityComments.filter(c => c.sentiment === 'neutral').length;
  const totalComments = priorityComments.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
            <CardDescription className="text-gray-400">
              Overall sentiment breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <SentimentChart
              positive={sentiment.positive}
              neutral={sentiment.neutral}
              negative={sentiment.negative}
            />
          </CardContent>
        </Card>

        <PriorityActions
          questionsCount={questionsCount}
          complaintsCount={complaintsCount}
          priorityCount={priorityComments.length}
          positivesCount={positivesCount}
          neutralCount={neutralCount}
          totalComments={totalComments}
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
