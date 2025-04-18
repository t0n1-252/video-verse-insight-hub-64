
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "@/lib/youtube-api";

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

const VideoCard = ({ video, onClick }: VideoCardProps) => {
  return (
    <Card 
      className="bg-gray-800 border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
      onClick={() => onClick(video)}
    >
      <CardHeader className="pb-2">
        <div className="aspect-video bg-gray-700 mb-2 overflow-hidden">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/600x400/666/fff?text=No+Thumbnail';
            }}
          />
        </div>
        <CardTitle className="text-lg text-gray-100">{video.title}</CardTitle>
        <CardDescription className="text-gray-400">
          Published: {new Date(video.publishDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{video.viewCount} views</span>
          <span className="text-blue-400">{video.commentCount} comments</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
