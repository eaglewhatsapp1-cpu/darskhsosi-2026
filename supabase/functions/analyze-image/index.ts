import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  imageBase64: string;
  prompt?: string;
  language?: 'ar' | 'en';
  educationLevel?: string;
  subject?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
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

    const { imageBase64, prompt, language = 'ar', educationLevel = 'high', subject = 'general' }: RequestBody = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build system prompt based on context
    const levelPrompts: Record<string, { ar: string; en: string }> = {
      elementary: { ar: 'اشرح بطريقة بسيطة جداً مناسبة لطالب ابتدائي', en: 'Explain very simply for an elementary student' },
      middle: { ar: 'اشرح بوضوح لطالب متوسط', en: 'Explain clearly for a middle school student' },
      high: { ar: 'اشرح بشكل مفصل لطالب ثانوي', en: 'Explain in detail for a high school student' },
      university: { ar: 'اشرح بعمق أكاديمي لطالب جامعي', en: 'Explain with academic depth for a university student' },
      professional: { ar: 'اشرح بشكل متخصص ومتقدم', en: 'Explain in a specialized and advanced way' }
    };

    const levelPrompt = levelPrompts[educationLevel]?.[language] || levelPrompts.high[language];

    const systemPrompt = language === 'ar' 
      ? `أنت معلم ذكي متخصص في تحليل الصور التعليمية والمسائل العلمية.
${levelPrompt}

عند تحليل صورة:
1. حدد نوع المسألة أو المحتوى (رياضيات، فيزياء، كيمياء، إلخ)
2. اشرح المفاهيم الموجودة في الصورة
3. إذا كانت مسألة، قم بحلها خطوة بخطوة
4. قدم نصائح للفهم والتطبيق
5. اذكر أي أخطاء شائعة يجب تجنبها

استخدم الرموز الرياضية بشكل صحيح واجعل الشرح واضحاً ومنظماً.`
      : `You are an intelligent tutor specialized in analyzing educational images and scientific problems.
${levelPrompt}

When analyzing an image:
1. Identify the type of problem or content (math, physics, chemistry, etc.)
2. Explain the concepts present in the image
3. If it's a problem, solve it step by step
4. Provide tips for understanding and application
5. Mention any common mistakes to avoid

Use mathematical symbols correctly and make the explanation clear and organized.`;

    const userPrompt = prompt || (language === 'ar' 
      ? 'حلل هذه الصورة واشرح محتواها بالتفصيل. إذا كانت تحتوي على مسألة، قم بحلها خطوة بخطوة.'
      : 'Analyze this image and explain its content in detail. If it contains a problem, solve it step by step.');

    // Call Lovable AI with Vision capability
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
