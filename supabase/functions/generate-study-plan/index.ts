import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Material {
  name: string;
  content: string;
}

interface RequestBody {
  materials: Material[];
  subject?: string;
  educationLevel?: string;
  learningStyle?: string;
  durationWeeks?: number;
  language?: 'ar' | 'en';
}

serve(async (req) => {
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

    const { 
      materials, 
      subject = 'general', 
      educationLevel = 'high', 
      learningStyle = 'visual',
      durationWeeks = 2,
      language = 'ar' 
    }: RequestBody = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const subjectNames: Record<string, { ar: string; en: string }> = {
      physics: { ar: 'الفيزياء', en: 'Physics' },
      chemistry: { ar: 'الكيمياء', en: 'Chemistry' },
      math: { ar: 'الرياضيات', en: 'Mathematics' },
      biology: { ar: 'الأحياء', en: 'Biology' },
      history: { ar: 'التاريخ', en: 'History' },
      arabic: { ar: 'اللغة العربية', en: 'Arabic' },
      english: { ar: 'اللغة الإنجليزية', en: 'English' },
      general: { ar: 'عام', en: 'General' }
    };

    const subjectName = subjectNames[subject]?.[language] || subjectNames.general[language];

    const materialsContext = materials
      .map(m => `📄 ${m.name}:\n${m.content}`)
      .join('\n\n');

    const systemPrompt = language === 'ar'
      ? `أنت مخطط تعليمي ذكي متخصص في إنشاء خطط دراسية مخصصة.
مهمتك إنشاء خطة دراسية مفصلة ومنظمة.

يجب أن ترد بتنسيق JSON فقط بالشكل التالي:
{
  "title": "عنوان الخطة",
  "overview": "نظرة عامة على الخطة",
  "weeks": [
    {
      "weekNumber": 1,
      "focus": "تركيز الأسبوع",
      "days": [
        {
          "day": "السبت",
          "topics": ["موضوع 1", "موضوع 2"],
          "duration": "ساعة واحدة",
          "activities": ["نشاط 1", "نشاط 2"]
        }
      ]
    }
  ],
  "tips": ["نصيحة 1", "نصيحة 2"]
}`
      : `You are an intelligent educational planner specialized in creating personalized study plans.
Your task is to create a detailed and organized study plan.

You must respond in JSON format only as follows:
{
  "title": "Plan Title",
  "overview": "Overview of the plan",
  "weeks": [
    {
      "weekNumber": 1,
      "focus": "Week focus",
      "days": [
        {
          "day": "Saturday",
          "topics": ["Topic 1", "Topic 2"],
          "duration": "1 hour",
          "activities": ["Activity 1", "Activity 2"]
        }
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}`;

    const userPrompt = language === 'ar'
      ? `أنشئ خطة دراسية لمدة ${durationWeeks} ${durationWeeks === 1 ? 'أسبوع' : 'أسابيع'} للمادة: ${subjectName}

المستوى التعليمي: ${educationLevel}
أسلوب التعلم المفضل: ${learningStyle}

المواد التعليمية المتاحة:
${materialsContext || 'لا توجد مواد محددة - أنشئ خطة عامة'}

أنشئ خطة دراسية تتضمن:
- جدول يومي واقعي
- توزيع المواضيع بشكل متوازن
- أنشطة متنوعة حسب أسلوب التعلم
- فترات راحة ومراجعة
- نصائح للنجاح`
      : `Create a study plan for ${durationWeeks} week${durationWeeks > 1 ? 's' : ''} for subject: ${subjectName}

Education level: ${educationLevel}
Preferred learning style: ${learningStyle}

Available study materials:
${materialsContext || 'No specific materials - create a general plan'}

Create a study plan that includes:
- Realistic daily schedule
- Balanced topic distribution
- Various activities based on learning style
- Rest and review periods
- Tips for success`;

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
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Failed to generate study plan');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let plan = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing plan JSON:', parseError);
    }

    return new Response(
      JSON.stringify({ plan, rawContent: content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-study-plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
