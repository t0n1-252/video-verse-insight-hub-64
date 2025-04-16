
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb } from "lucide-react";

interface ContentOpportunity {
  id: string;
  title: string;
  description: string;
  relevantComments: number;
  confidence: number;
}

interface ContentOpportunitiesProps {
  opportunities: ContentOpportunity[];
}

const ContentOpportunities = ({ opportunities }: ContentOpportunitiesProps) => {
  // Helper function to determine confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-blue-500";
    return "bg-amber-500";
  };

  // Helper function to determine confidence text
  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return "High confidence";
    if (confidence >= 60) return "Medium confidence";
    return "Low confidence";
  };

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">No content opportunities detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center">
          <Lightbulb className="mr-2 text-purple-400" />
          Content Opportunities
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          AI-generated content ideas based on your viewers' comments and questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-gray-100">{opportunity.title}</CardTitle>
                <Badge className="bg-purple-600">{opportunity.relevantComments} comments</Badge>
              </div>
              <CardDescription className="text-gray-400">{opportunity.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className={`text-${getConfidenceColor(opportunity.confidence).replace('bg-', '')}`}>
                    {getConfidenceText(opportunity.confidence)}
                  </span>
                  <span className="text-gray-400">{opportunity.confidence}%</span>
                </div>
                <Progress 
                  value={opportunity.confidence} 
                  className="h-2"
                  style={{
                    "--progress-color": getConfidenceColor(opportunity.confidence),
                  } as React.CSSProperties}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentOpportunities;
