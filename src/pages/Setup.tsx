
import React from 'react';
import APICredentialsGuide from '@/components/APICredentialsGuide';

const Setup = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-purple-500">Video</span>
          <span className="text-blue-400">Verse</span> Setup
        </h1>
        <p className="text-gray-400 mb-8">Configure your YouTube API credentials to use this application.</p>
        
        <div className="max-w-4xl mx-auto">
          <APICredentialsGuide />
        </div>
      </div>
    </div>
  );
};

export default Setup;
