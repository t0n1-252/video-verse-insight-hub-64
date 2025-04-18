
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SentimentChart from "@/components/SentimentChart";
import CommentList from "@/components/CommentList";
import { Comment as UiComment } from "@/components/CommentList";

interface VideoOverviewTabProps {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  priorityComments: UiComment[];
  onViewAllComments: () => void;
}

const VideoOverviewTab = ({ sentiment, priorityComments, onViewAllComments }: VideoOverviewTabProps) => {
  return (
    <div>
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
            onClick={onViewAllComments}
          >
            View All Comments
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoOverviewTab;
