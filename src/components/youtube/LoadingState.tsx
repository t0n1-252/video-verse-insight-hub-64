
import { Spinner } from "@/components/ui/spinner";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Spinner className="h-8 w-8 border-t-2 mb-4" />
      <p className="text-gray-400">{message}</p>
    </div>
  );
};

export default LoadingState;
