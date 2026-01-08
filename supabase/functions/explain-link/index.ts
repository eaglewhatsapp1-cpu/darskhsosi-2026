import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  url: string;
  language?: 'ar' | 'en';
  educationLevel?: string;
  learningStyle?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, language = 'ar', educationLevel = 'high', learningStyle = 'visual' }: RequestBody = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch the webpage content
    let pageContent = '';
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EducationalBot/1.0)',
        },
      });
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        // Extract text content (basic extraction)
        pageContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 8000); // Limit content size
      }
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError);
      pageContent = `Unable to fetch content from ${url}. Please analyze based on the URL structure.`;
    }

    const levelContext: Record<string, { ar: string; en: string }> = {
      elementary: { ar: 'بسط المحتوى جداً لطالب ابتدائي', en: 'Simplify greatly for elementary student' },
      middle: { ar: 'اشرح بوضوح لطالب متوسط', en: 'Explain clearly for middle school student' },
      high: { ar: 'اشرح بتفصيل لطالب ثانوي', en: 'Explain in detail for high school student' },
      university: { ar: 'حلل بعمق لطالب جامعي', en: 'Analyze in depth for university student' },
      professional: { ar: 'قدم تحليلاً متخصصاً', en: 'Provide specialized analysis' }
    };

    const systemPrompt = language === 'ar'
      ? `أنت مساعد تعليمي ذكي متخصص في تحليل وشرح محتوى المواقع والمقالات.
${levelContext[educationLevel]?.ar || levelContext.high.ar}

مهمتك:
1. تحليل المحتوى المقدم من الموقع
2. استخراج النقاط الرئيسية
3. شرح المفاهيم المعقدة بشكل مبسط
4. ربط المعلومات بالسياق التعليمي
5. اقتراح موضوعات للبحث الإضافي

قدم الشرح بشكل منظم وسهل الفهم.`
      : `You are an intelligent educational assistant specialized in analyzing and explaining website and article content.
${levelContext[educationLevel]?.en || levelContext.high.en}

Your task:
1. Analyze the provided website content
2. Extract key points
3. Explain complex concepts in a simplified way
4. Connect information to educational context
5. Suggest topics for further research

Provide the explanation in an organized and easy-to-understand manner.`;

    const userPrompt = language === 'ar'
      ? `قم بتحليل وشرح محتوى هذا الموقع:
URL: ${url}

المحتوى المستخرج:
${pageContent}

قدم ملخصاً شاملاً يتضمن:
- الفكرة الرئيسية
- النقاط المهمة
- المفاهيم الجديدة
- كيف يمكن الاستفادة من هذا المحتوى تعليمياً`
      : `Analyze and explain the content of this website:
URL: ${url}

Extracted content:
${pageContent}

Provide a comprehensive summary including:
- Main idea
- Important points
- New concepts
- How this content can be used educationally`;

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
          { role: 'user', content: userPrompt }
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
      throw new Error('Failed to explain link');
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain-link:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
