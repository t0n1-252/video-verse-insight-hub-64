
import { ThreeDotsFade } from 'react-svg-spinners';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <ThreeDotsFade color="#3b82f6" height={24} />
      <p className="text-gray-400">Initializing YouTube API...</p>
    </div>
  );
};

export default LoadingState;
