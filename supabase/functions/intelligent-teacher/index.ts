import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: Message[];
  learnerProfile?: {
    name: string;
    educationLevel: string;
    learningStyle: string;
    preferredLanguage: string;
  };
  uploadedMaterials?: string[];
  materialContent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    const { messages, learnerProfile, uploadedMaterials, materialContent } = await req.json() as RequestBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on learner profile
    const lang = learnerProfile?.preferredLanguage === 'ar' ? 'Arabic' : 'English';
    const levelMap: Record<string, string> = {
      elementary: 'elementary school student (ages 6-11)',
      middle: 'middle school student (ages 11-14)',
      high: 'high school student (ages 14-18)',
      university: 'university student',
      professional: 'professional learner',
    };
    const styleMap: Record<string, string> = {
      visual: 'visual learning with diagrams and images',
      practical: 'practical examples and hands-on exercises',
      illustrative: 'detailed explanations with analogies',
    };

    const level = levelMap[learnerProfile?.educationLevel || 'university'] || 'university student';
    const style = styleMap[learnerProfile?.learningStyle || 'illustrative'] || 'detailed explanations';
    const name = learnerProfile?.name || 'Learner';

    let systemPrompt = `You are an intelligent, caring teacher named "Dars Khusoosi" (درس خصوصي). 
You are teaching ${name}, who is a ${level}.

CRITICAL RULES:
1. ALWAYS respond in ${lang}
2. Adapt your explanations to be appropriate for a ${level}
3. Use ${style} as your primary teaching method
4. Be encouraging, patient, and supportive
5. Break down complex concepts into simple, digestible parts
6. Ask follow-up questions to ensure understanding
7. Use examples relevant to the learner's level and interests

TEACHING APPROACH:
- Start with what the learner already knows
- Build concepts step by step
- Use analogies and real-world examples
- Encourage questions and curiosity
- Celebrate progress and effort
- Provide constructive feedback`;

    if (uploadedMaterials && uploadedMaterials.length > 0) {
      systemPrompt += `\n\nThe learner has selected the following materials from their Knowledge Base: ${uploadedMaterials.join(', ')}.`;
      
      if (materialContent) {
        systemPrompt += `\n\nHere is the content of the selected materials for your reference:\n${materialContent}\n\nCRITICAL: Base your teaching and answers ONLY on this content. If the answer is not in the provided content, explain that you can only answer based on the uploaded materials.`;
      } else {
        systemPrompt += `\n\nBase your teaching on these materials when relevant. If asked about topics not covered in these materials, politely explain that you can only teach based on the uploaded content.`;
      }
    } else {
      systemPrompt += `\n\nNote: No learning materials have been uploaded yet. Encourage the learner to upload 
study materials (PDFs, documents, images) for more focused and effective learning. You can still have 
general educational conversations and answer questions.`;
    }

    console.log("Sending request to Lovable AI with profile:", learnerProfile);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please check your account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received, streaming back to client");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in intelligent-teacher function:", error);
    // Return generic error to client, keep details in server logs
    return new Response(
      JSON.stringify({ error: "Unable to process request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
