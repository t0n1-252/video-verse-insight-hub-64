
import React from 'react';
import { Users } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
        <Users className="w-6 h-6 text-white" />
      </div>
      <span className="font-bold text-xl bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
        Follower Insights
      </span>
    </div>
  );
};

export default Logo;
