
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, ThumbsUp, HelpCircle, AlertCircle, CircleDot, Flame, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PriorityActionsProps {
  questionsCount: number;
  complaintsCount: number;
  priorityCount: number;
  positivesCount: number;
  neutralCount: number;
  totalComments: number;
}

const PriorityActions = ({ 
  questionsCount, 
  complaintsCount, 
  priorityCount,
  positivesCount,
  neutralCount,
  totalComments 
}: PriorityActionsProps) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Comments Overview</span>
          <span className="text-sm font-normal text-gray-400">
            Total: {totalComments}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="text-purple-400" size={16} />
                <span className="text-gray-200 text-sm">Priority Comments</span>
              </div>
              <span className="text-purple-400 text-sm">{priorityCount}</span>
            </div>
            <Progress 
              value={(priorityCount / totalComments) * 100} 
              className="h-1 bg-gray-700"
              style={{ "--progress-color": "rgb(192, 132, 252)" } as React.CSSProperties}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="text-red-400" size={16} />
                <span className="text-gray-200 text-sm">Hot Leads</span>
              </div>
              <span className="text-red-400 text-sm">{priorityCount}</span>
            </div>
            <Progress 
              value={(priorityCount / totalComments) * 100} 
              className="h-1 bg-gray-700"
              style={{ "--progress-color": "rgb(248, 113, 113)" } as React.CSSProperties}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="text-blue-400" size={16} />
                <span className="text-gray-200 text-sm">Most Liked</span>
              </div>
              <span className="text-blue-400 text-sm">{positivesCount}</span>
            </div>
            <Progress 
              value={(positivesCount / totalComments) * 100} 
              className="h-1 bg-gray-700"
              style={{ "--progress-color": "rgb(96, 165, 250)" } as React.CSSProperties}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="text-amber-400" size={16} />
                <span className="text-gray-200 text-sm">Most Engagement</span>
              </div>
              <span className="text-amber-400 text-sm">{positivesCount}</span>
            </div>
            <Progress 
              value={(positivesCount / totalComments) * 100} 
              className="h-1 bg-gray-700"
              style={{ "--progress-color": "rgb(251, 191, 36)" } as React.CSSProperties}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-blue-400" size={16} />
                <span className="text-gray-200 text-sm">Questions</span>
              </div>
              <span className="text-blue-400 text-sm">{questionsCount}</span>
            </div>
            <Progress 
              value={(questionsCount / totalComments) * 100} 
              className="h-1 bg-gray-700"
              style={{ "--progress-color": "rgb(96, 165, 250)" } as React.CSSProperties}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="text-green-400" size={16} />
                <span className="text-gray-200 text-sm">Testimonials</span>
              </div>
              <span className="text-green-400 text-sm">{positivesCount}</span>
            </div>
            <Progress 
              value={(positivesCount / totalComments) * 100} 
              className="h-1 bg-gray-700"
              style={{ "--progress-color": "rgb(74, 222, 128)" } as React.CSSProperties}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-amber-400" size={16} />
                <span className="text-gray-200 text-sm">Complaints</span>
              </div>
              <span className="text-amber-400 text-sm">{complaintsCount}</span>
            </div>
            <Progress 
              value={(complaintsCount / totalComments) * 100} 
              className="h-1 bg-gray-700"
              style={{ "--progress-color": "rgb(251, 191, 36)" } as React.CSSProperties}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDot className="text-gray-400" size={16} />
                <span className="text-gray-200 text-sm">Neutral</span>
              </div>
              <span className="text-gray-400 text-sm">{neutralCount}</span>
            </div>
            <Progress 
              value={(neutralCount / totalComments) * 100} 
              className="h-1 bg-gray-700"
              style={{ "--progress-color": "rgb(156, 163, 175)" } as React.CSSProperties}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriorityActions;
