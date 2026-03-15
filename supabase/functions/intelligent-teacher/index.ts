import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const hasBearerToken = !!authHeader && authHeader.startsWith("Bearer ");

    let user: { id: string } | null = null;

    // Create Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: hasBearerToken
        ? { headers: { Authorization: authHeader! } }
        : {},
    });

    // Try to authenticate user only if Authorization header exists
    if (hasBearerToken) {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabaseClient.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError);
      } else if (authUser) {
        user = { id: authUser.id };
      }
    } else {
      console.log("No Authorization header provided. Continuing as unauthenticated request.");
    }

    const body = (await req.json()) as RequestBody;
    const { messages, learnerProfile, uploadedMaterials, materialContent } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json() as RequestBody;
    const { messages, learnerProfile, uploadedMaterials, materialContent } = body;

    // Server-side input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const MAX_MESSAGE_LENGTH = 50000;
    const MAX_MESSAGES = 100;

    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: 'Too many messages in conversation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid message format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (msg.role !== 'system' && msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: 'Message content too long' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    const MAX_MESSAGE_LENGTH = 50000;
    const MAX_MESSAGES = 100;

    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Too many messages in conversation" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    for (const msg of messages) {
      if (
        !msg ||
        !msg.role ||
        !msg.content ||
        typeof msg.content !== "string"
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!["system", "user", "assistant"].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Invalid message role" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (msg.role !== "system" && msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: "Message content too long" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Fetch user's personal API keys only if authenticated
    let profileData: { openai_api_key?: string; gemini_api_key?: string; custom_api_key?: string; custom_base_url?: string; custom_model?: string } | null = null;

    if (user?.id) {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("openai_api_key, gemini_api_key, custom_api_key, custom_base_url, custom_model")
        .eq("id", user.id) // FIXED: profiles table uses id, not user_id
        .maybeSingle();

      if (error) {
        console.error("Profile fetch error:", error);
      } else {
        profileData = data;
      }
    }

    let apiBaseUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    let apiKey = Deno.env.get("LOVABLE_API_KEY");
    let model = "google/gemini-2.5-flash";

    // Priority 1: User's Custom key
    if (profileData?.custom_api_key) {
      apiKey = profileData.custom_api_key;
      // Default to OpenAI structure if baseUrl isn't provided (many providers are OpenAI compatible like OpenRouter, Together, etc)
      apiBaseUrl = profileData.custom_base_url || "https://api.openai.com/v1/chat/completions";
      model = profileData.custom_model || "gpt-4o-mini";
      console.log(`Using personal Custom key for user ${user?.id}`);
    }
    // Priority 2: User's Gemini key
    else if (profileData?.gemini_api_key) {
      apiKey = profileData.gemini_api_key;
      apiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/chat/completions";
      model = "gemini-1.5-flash";
      console.log(`Using personal Gemini key for user ${user?.id}`);
    }
    // Priority 3: User's OpenAI key
    else if (profileData?.openai_api_key) {
      apiKey = profileData.openai_api_key;
      apiBaseUrl = "https://api.openai.com/v1/chat/completions";
      model = "gpt-4o-mini";
      console.log(`Using personal OpenAI key for user ${user?.id}`);
    } else {
      console.log("Using default LOVABLE_API_KEY");
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "AI API key is not configured on the server or in the user profile.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const hasFrontEndSystemPrompt =
      messages.length > 0 && messages[0].role === "system";

    let finalMessages = [...messages];

    const name = learnerProfile?.name || "Learner";
    const level = learnerProfile?.educationLevel || "university";
    const style = learnerProfile?.learningStyle || "visual";
    const lang =
      learnerProfile?.preferredLanguage === "en" ? "English" : "Arabic";

    if (!hasFrontEndSystemPrompt) {
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
        systemPrompt += `

- The learner has provided these materials: ${uploadedMaterials.join(", ")}.
- ALWAYS prioritize information from these materials if relevant to the question.
- If the materials don't cover a topic, mention it and provide general knowledge.`;

        if (materialContent) {
          systemPrompt += `

REFERENCE CONTENT FOR CONTEXT:
${materialContent.substring(0, 25000)}`;
        }
      } else {
        systemPrompt += `
- No specific materials provided. Use your general academic knowledge base.`;
      }

      finalMessages = [{ role: "system", content: systemPrompt }, ...messages];
    } else {
      let enhancedPrompt = finalMessages[0].content;

      if (!enhancedPrompt.includes(name)) {
        enhancedPrompt =
          `Student: ${name} (${level} level, ${style} learner).\n` +
          enhancedPrompt;
      }

      if (materialContent && !enhancedPrompt.includes("REFERENCE CONTENT")) {
        enhancedPrompt += `

REFERENCE CONTENT FROM KNOWLEDGE BASE:
${materialContent.substring(0, 25000)}`;
      }

      finalMessages[0].content = enhancedPrompt;
    }

    console.log(
      `Sending request to AI at ${apiBaseUrl} using model ${model}${
        user?.id ? ` for user ${user.id}` : " for guest request"
      }`
    );

    const aiResponse = await fetch(apiBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI service error:", aiResponse.status, errorText);

      if (aiResponse.status === 401) {
        return new Response(
          JSON.stringify({
            error: "AI provider authorization failed. Please verify the API key.",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Usage limit reached. Please check your account.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "AI service temporarily unavailable",
          details: errorText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("AI response received, streaming back to client");

    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in intelligent-teacher function:", error);

    return new Response(
      JSON.stringify({
        error: "Unable to process request. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
