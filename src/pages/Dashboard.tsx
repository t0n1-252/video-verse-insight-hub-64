
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import VideoAnalysis from "./VideoAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for initial development
const MOCK_VIDEOS = [
  {
    id: "video1",
    title: "How to Build a React App in 10 Minutes",
    thumbnail: "https://i.imgur.com/JvYeG1Z.jpg",
    publishDate: "2023-12-15",
    viewCount: "45,231",
    commentCount: 378,
  },
  {
    id: "video2",
    title: "Advanced TypeScript Tips for Developers",
    thumbnail: "https://i.imgur.com/Nbgends.jpg",
    publishDate: "2024-01-22",
    viewCount: "32,182",
    commentCount: 256,
  },
  {
    id: "video3",
    title: "Creating Custom Hooks in React",
    thumbnail: "https://i.imgur.com/6Hlfxkg.jpg",
    publishDate: "2024-02-05",
    viewCount: "28,933",
    commentCount: 194,
  }
];

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  const filteredVideos = MOCK_VIDEOS.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-purple-500">Video</span>
          <span className="text-blue-400">Verse</span> Insight Hub
        </h1>

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!selectedVideo}>
              Video Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search videos..."
                  className="pl-10 bg-gray-800 border-gray-700 text-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => (
                <Card 
                  key={video.id}
                  className="bg-gray-800 border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
                  onClick={() => handleVideoSelect(video)}
                >
                  <CardHeader className="pb-2">
                    <div className="aspect-video bg-gray-700 mb-2 overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-lg text-gray-100">{video.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      Published: {video.publishDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{video.viewCount} views</span>
                      <span className="text-blue-400">{video.commentCount} comments</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400">No videos found matching your search.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            {selectedVideo && <VideoAnalysis video={selectedVideo} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
