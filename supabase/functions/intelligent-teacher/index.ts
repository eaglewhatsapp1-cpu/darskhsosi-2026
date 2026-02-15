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

    // Fetch user's personal API keys if they exist
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('openai_api_key, gemini_api_key')
      .eq('user_id', user.id)
      .single();

    let apiBaseUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    let apiKey = Deno.env.get("LOVABLE_API_KEY");
    let model = "google/gemini-1.5-flash";

    // Priority 1: User's Gemini Key (cheapest/most flexible for this app)
    if (profileData?.gemini_api_key) {
      apiKey = profileData.gemini_api_key;
      apiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/chat/completions";
      model = "gemini-1.5-flash";
      console.log(`Using user's personal Gemini key for ${user.id}`);
    }
    // Priority 2: User's OpenAI Key
    else if (profileData?.openai_api_key) {
      apiKey = profileData.openai_api_key;
      apiBaseUrl = "https://api.openai.com/v1/chat/completions";
      model = "gpt-4o-mini";
      console.log(`Using user's personal OpenAI key for ${user.id}`);
    }

    if (!apiKey) {
      throw new Error("AI API Key is not configured. Please add one in your profile or contact administrator.");
    }

    // Check if the first message is already a system prompt from the frontend
    const hasFrontEndSystemPrompt = messages.length > 0 && messages[0].role === 'system';

    let finalMessages = [...messages];

    // Fallback profile values
    const name = learnerProfile?.name || 'Learner';
    const level = learnerProfile?.educationLevel || 'university';
    const style = learnerProfile?.learningStyle || 'visual';
    const lang = learnerProfile?.preferredLanguage === 'en' ? 'English' : 'Arabic';

    if (!hasFrontEndSystemPrompt) {
      // Build a robust system prompt if one wasn't provided
      let systemPrompt = `You are "Dars Khusoosi" (درس خصوصي), an expert-level personalized educational companion.
Your mission is to guide ${name} through their learning journey with a highly adapted teaching style.

STUDENT CONTEXT:
- Level: ${level}
- Preferred Learning Style: ${style}
- Primary Language: ${lang}

TEACHING PRINCIPLES:
1. ADAPT TO LEVEL: For "elementary", use simple analogies. For "professional", use technical terminology.
2. ADAPT TO STYLE: If "visual", describe images/diagrams or use emoji-based layouts. If "practical", suggest exercises.
3. LANGUAGE CONSISTENCY: Always respond primarily in ${lang}, but you can provide key terms in both Arabic and English if helpful.
4. STRUCTURE: Use Markdown (bolding, lists, headers) to make complex topics digestible.
5. INTERACTIVITY: End your responses with a thought-provoking question to keep the learner engaged.

KNOWLEDGE BASE USAGE:`;

      if (uploadedMaterials && uploadedMaterials.length > 0) {
        systemPrompt += `\n- The learner has provided these materials: ${uploadedMaterials.join(', ')}.
- ALWAYS prioritize information from these materials if relevant to the question.
- If the materials don't cover a topic, mention it and provide general knowledge.`;

        if (materialContent) {
          systemPrompt += `\n\nREFERENCE CONTENT FOR CONTEXT:\n${materialContent.substring(0, 25000)}`;
        }
      } else {
        systemPrompt += `\n- No specific materials provided. Use your general academic knowledge base.`;
      }

      finalMessages = [{ role: "system", content: systemPrompt }, ...messages];
    } else {
      // Enhance the existing system prompt with profile context if it's missing
      let enhancedPrompt = finalMessages[0].content;

      if (!enhancedPrompt.includes(name)) {
        enhancedPrompt = `Student: ${name} (${level} level, ${style} learner).\n` + enhancedPrompt;
      }

      if (materialContent && !enhancedPrompt.includes('REFERENCE CONTENT')) {
        enhancedPrompt += `\n\nREFERENCE CONTENT FROM KNOWLEDGE BASE:\n${materialContent.substring(0, 25000)}`;
      }

      finalMessages[0].content = enhancedPrompt;
    }

    console.log(`Sending request to AI at ${apiBaseUrl} for user ${user.id} using model ${model}`);

    const aiResponse = await fetch(apiBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: finalMessages,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI service error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
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

    return new Response(aiResponse.body, {
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
