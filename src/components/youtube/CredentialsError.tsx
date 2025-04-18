
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CredentialsError = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6">
      <div className="text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-amber-500" />
        <h2 className="text-2xl font-bold text-gray-100">YouTube API Not Configured</h2>
        <p className="text-gray-400 max-w-md">
          You need to set up your YouTube API credentials before using this feature.
        </p>
      </div>
      
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
        onClick={() => navigate('/setup')}
      >
        <AlertCircle className="mr-2 h-5 w-5" />
        Go to Setup Instructions
      </Button>
    </div>
  );
};

export default CredentialsError;
