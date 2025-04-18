
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comments } = await req.json();
    
    // Combine all comments into a single text for analysis
    const commentsText = comments.map((c: any) => c.text).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis expert. Analyze the following YouTube comments and return only a JSON object with three numbers that sum to 100: positive (percentage of positive sentiment), neutral (percentage of neutral sentiment), and negative (percentage of negative sentiment).'
          },
          {
            role: 'user',
            content: commentsText
          }
        ],
      }),
    });

    const data = await response.json();
    let sentimentResult;
    
    try {
      // Parse the response content as JSON
      sentimentResult = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If parsing fails, use a default format
      sentimentResult = {
        positive: 0,
        neutral: 0,
        negative: 0
      };
    }

    return new Response(JSON.stringify(sentimentResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
