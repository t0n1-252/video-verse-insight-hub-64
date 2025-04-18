
import { ThreeDotsFade } from "react-svg-spinners";

const VideoLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-20">
      <ThreeDotsFade color="#3b82f6" height={40} />
      <p className="mt-4 text-gray-400">Loading your videos...</p>
    </div>
  );
};

export default VideoLoadingState;
