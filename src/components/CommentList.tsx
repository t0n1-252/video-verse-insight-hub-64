import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, AlertCircle, ThumbsUp, MessageCircle, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Comment {
  id: string;
  author: string;
  profilePic: string;
  text: string;
  likes: number;
  timestamp: string;
  sentiment: "positive" | "neutral" | "negative";
  isQuestion: boolean;
  isComplaint: boolean;
  isPriority: boolean;
  replies?: Comment[]; // Adding replies property to support engagement sorting
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList = ({ comments }: CommentListProps) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId === replyingTo ? null : commentId);
    setReplyText("");
  };

  const handleSendReply = (commentId: string) => {
    console.log(`Reply to comment ${commentId}: ${replyText}`);
    setReplyingTo(null);
    setReplyText("");
    // In a real app, this would send the reply to an API
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "negative":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">No comments in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="bg-gray-800 border-gray-700 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={comment.profilePic} alt={comment.author} />
                <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-100">{comment.author}</span>
                    <span className="text-xs text-gray-400">{comment.timestamp}</span>
                    
                    {comment.isQuestion && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <HelpCircle size={12} className="mr-1" />
                        Question
                      </Badge>
                    )}
                    
                    {comment.isComplaint && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        <AlertCircle size={12} className="mr-1" />
                        Complaint
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className={getSentimentColor(comment.sentiment)}>
                      {comment.sentiment.charAt(0).toUpperCase() + comment.sentiment.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-400">
                    <ThumbsUp size={14} />
                    <span className="text-xs">{comment.likes}</span>
                  </div>
                </div>
                
                <p className="text-gray-100">{comment.text}</p>
                
                <div className="flex items-center gap-2 pt-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-gray-100"
                    onClick={() => handleReplyClick(comment.id)}
                  >
                    <MessageCircle size={16} className="mr-1" />
                    Reply
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                    <Flag size={16} className="mr-1" />
                    Flag
                  </Button>
                </div>
                
                {replyingTo === comment.id && (
                  <div className="mt-3 space-y-2">
                    <Textarea 
                      placeholder="Write your reply..."
                      className="bg-gray-700 border-gray-600 text-gray-100"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSendReply(comment.id)}
                        disabled={!replyText.trim()}
                      >
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommentList;
