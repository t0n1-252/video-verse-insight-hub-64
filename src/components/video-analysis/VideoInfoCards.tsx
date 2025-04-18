
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, AlertCircle, Lightbulb } from "lucide-react";

interface VideoInfoCardsProps {
  questionsCount: number;
  complaintsCount: number;
  opportunitiesCount: number;
}

const VideoInfoCards = ({ questionsCount, complaintsCount, opportunitiesCount }: VideoInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-md text-gray-100">Video Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center">
              <HelpCircle className="mr-2 text-blue-400" size={18} />
              <div>
                <p className="text-gray-100">{questionsCount} questions</p>
                <p className="text-xs text-gray-400">Need your response</p>
              </div>
            </div>
            <div className="flex items-center">
              <AlertCircle className="mr-2 text-amber-400" size={18} />
              <div>
                <p className="text-gray-100">{complaintsCount} complaints</p>
                <p className="text-xs text-gray-400">May need addressing</p>
              </div>
            </div>
            <div className="flex items-center">
              <Lightbulb className="mr-2 text-purple-400" size={18} />
              <div>
                <p className="text-gray-100">{opportunitiesCount} content ideas</p>
                <p className="text-xs text-gray-400">Based on comments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoInfoCards;
