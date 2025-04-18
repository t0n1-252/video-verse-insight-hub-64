
import { Card, CardContent } from "@/components/ui/card";

interface VideoInfoProps {
  publishDate: string;
  views: number;
  comments: number;
}

const VideoInfo = ({ publishDate, views, comments }: VideoInfoProps) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-200">Video Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Published:</span>
            <span className="text-gray-200">{publishDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Views:</span>
            <span className="text-gray-200">{views.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Comments:</span>
            <span className="text-gray-200">{comments.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoInfo;
