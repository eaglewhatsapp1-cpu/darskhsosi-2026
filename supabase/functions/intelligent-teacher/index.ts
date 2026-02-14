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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, learnerProfile, uploadedMaterials, materialContent } = await req.json() as RequestBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check if the first message is already a system prompt from the frontend
    const hasFrontEndSystemPrompt = messages.length > 0 && messages[0].role === 'system';

    let finalMessages = [...messages];

    if (!hasFrontEndSystemPrompt) {
      // Build a fallback system prompt if one wasn't provided
      const lang = learnerProfile?.preferredLanguage === 'ar' ? 'Arabic' : 'English';
      const level = learnerProfile?.educationLevel || 'university';
      const style = learnerProfile?.learningStyle || 'visual';
      const name = learnerProfile?.name || 'Learner';

      let systemPrompt = `You are "Dars Khusoosi" (درس خصوصي), an intelligent educational assistant.
You are teaching ${name}, who is at ${level} level with a ${style} learning style.
- ALWAYS respond in ${lang}
- Use Markdown for structured formatting.
- Be encouraging and supportive.`;

      if (uploadedMaterials && uploadedMaterials.length > 0) {
        systemPrompt += `\n- Knowledge Base: ${uploadedMaterials.join(', ')}`;
        if (materialContent) {
          systemPrompt += `\n- Reference Content: ${materialContent.substring(0, 30000)}`;
        }
      }

      finalMessages = [{ role: "system", content: systemPrompt }, ...messages];
    } else {
      // If we have a system prompt, just ensure it includes the material content if available and not already there
      if (materialContent && !messages[0].content.includes('Reference Content')) {
        finalMessages[0].content += `\n\n--- Reference Content from Knowledge Base (TRUNCATED):\n${materialContent.substring(0, 30000)}`;
      }
    }

    console.log("Sending request to Lovable AI for user:", user.id);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash",
        messages: finalMessages,
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
