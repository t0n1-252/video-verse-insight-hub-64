
import { Button } from "@/components/ui/button";
import { Video } from "@/lib/youtube-api";
import { RefreshCw } from "lucide-react";
import VideoCard from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  onRetry: () => void;
}

const VideoGrid = ({ videos, onVideoSelect, onRetry }: VideoGridProps) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">No videos found matching your search.</p>
        <Button 
          onClick={onRetry} 
          className="mt-4 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Loading Videos
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map(video => (
        <VideoCard 
          key={video.id} 
          video={video} 
          onClick={onVideoSelect}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
