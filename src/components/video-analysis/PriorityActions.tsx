
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, MessageCircle, AlertCircle } from "lucide-react";

interface PriorityActionsProps {
  questionsCount: number;
  complaintsCount: number;
  priorityCount: number;
}

const PriorityActions = ({ questionsCount, complaintsCount, priorityCount }: PriorityActionsProps) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg">Priority Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="text-purple-400" size={18} />
            <span className="text-gray-200">Priority Comments</span>
          </div>
          <span className="text-purple-400 font-semibold">{priorityCount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-blue-400" size={18} />
            <span className="text-gray-200">Questions</span>
          </div>
          <span className="text-blue-400 font-semibold">{questionsCount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-amber-400" size={18} />
            <span className="text-gray-200">Complaints</span>
          </div>
          <span className="text-amber-400 font-semibold">{complaintsCount}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriorityActions;
