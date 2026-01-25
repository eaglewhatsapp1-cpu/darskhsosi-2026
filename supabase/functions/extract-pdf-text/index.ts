import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { storagePath, materialId } = await req.json();

    if (!storagePath || !materialId) {
      return new Response(
        JSON.stringify({ error: 'Missing storagePath or materialId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the material belongs to the user
    const { data: material, error: materialError } = await supabaseClient
      .from('uploaded_materials')
      .select('*')
      .eq('id', materialId)
      .eq('user_id', userId)
      .single();

    if (materialError || !material) {
      return new Response(
        JSON.stringify({ error: 'Material not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('learning-materials')
      .download(storagePath);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to extract text from the PDF
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Convert PDF to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUri = `data:application/pdf;base64,${base64}`;

    // Use Gemini to extract text from PDF
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a document text extractor. Extract ALL text content from the provided document. Return ONLY the extracted text without any commentary, formatting instructions, or metadata. Preserve the structure and order of the content.'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Extract all text content from this PDF document. Return only the raw text content, preserving structure and order.' 
              },
              {
                type: 'image_url',
                image_url: { url: dataUri }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI extraction error:', response.status, errorText);
      throw new Error('Failed to extract text from PDF');
    }

    const aiResponse = await response.json();
    const extractedText = aiResponse.choices?.[0]?.message?.content || '';

    // Update the material with extracted content
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const truncatedText = extractedText.length > 100000 
      ? extractedText.substring(0, 100000) + '\n\n[Content truncated...]'
      : extractedText;

    const { error: updateError } = await serviceClient
      .from('uploaded_materials')
      .update({ content: truncatedText })
      .eq('id', materialId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to save extracted content');
    }

    console.log(`Successfully extracted ${extractedText.length} characters from PDF for material ${materialId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentLength: truncatedText.length,
        preview: truncatedText.substring(0, 200) + '...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-pdf-text:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
