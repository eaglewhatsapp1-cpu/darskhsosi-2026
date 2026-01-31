import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Extract text from DOCX (which is a ZIP of XML files)
async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(arrayBuffer);
    
    // Get the main document content
    const documentXml = await contents.file('word/document.xml')?.async('string');
    if (!documentXml) {
      throw new Error('No document.xml found in DOCX');
    }

    // Parse the XML and extract text content
    // Remove XML tags and extract text between <w:t> tags
    const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const paragraphBreaks = documentXml.match(/<\/w:p>/g) || [];
    
    let text = '';
    let lastIndex = 0;
    
    // Simple text extraction - get all text between w:t tags
    const allText: string[] = [];
    let currentParagraph: string[] = [];
    
    // Split by paragraph markers
    const paragraphs = documentXml.split(/<\/w:p>/);
    
    for (const para of paragraphs) {
      const matches = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
      const paraText = matches.map(match => {
        const textMatch = match.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
        return textMatch ? textMatch[1] : '';
      }).join('');
      
      if (paraText.trim()) {
        allText.push(paraText);
      }
    }
    
    return allText.join('\n\n');
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Extract text from PDF using Gemini Vision
async function extractPdfText(arrayBuffer: ArrayBuffer, apiKey: string): Promise<string> {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const dataUri = `data:application/pdf;base64,${base64}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `You are a document text extractor. Your job is to extract ALL text content from documents.

CRITICAL RULES:
1. Extract ALL text exactly as it appears in the document
2. Preserve the structure, headings, paragraphs, and lists
3. Do NOT summarize - extract the FULL content
4. Do NOT add any commentary or explanations
5. If the document is in Arabic or any other language, keep the text in its original language
6. Return ONLY the extracted text

This is for a RAG system that needs the complete document content for accurate answers.`
        },
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Extract ALL text content from this PDF document. Return the complete text preserving structure and order. Do not summarize or skip any content.' 
            },
            {
              type: 'image_url',
              image_url: { url: dataUri }
            }
          ]
        }
      ],
      max_tokens: 16000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI extraction error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    throw new Error(`Failed to extract text from PDF: ${response.status}`);
  }

  const aiResponse = await response.json();
  return aiResponse.choices?.[0]?.message?.content || '';
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

    const { storagePath, materialId, fileType } = await req.json();
    console.log(`Processing document extraction for material ${materialId}, type: ${fileType}, path: ${storagePath}`);

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
      console.error('Material not found:', materialError);
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

    const arrayBuffer = await fileData.arrayBuffer();
    let extractedText = '';

    // Determine file type and extract accordingly
    const isDocx = fileType?.includes('word') || 
                   fileType?.includes('docx') || 
                   storagePath?.toLowerCase().endsWith('.docx');
    
    const isDoc = fileType?.includes('msword') || 
                  storagePath?.toLowerCase().endsWith('.doc');
    
    const isPdf = fileType?.includes('pdf') || 
                  storagePath?.toLowerCase().endsWith('.pdf');

    console.log(`File type detection: isDocx=${isDocx}, isDoc=${isDoc}, isPdf=${isPdf}`);

    if (isDocx) {
      // Extract DOCX text directly using JSZip
      console.log('Extracting DOCX content...');
      extractedText = await extractDocxText(arrayBuffer);
      console.log(`Extracted ${extractedText.length} characters from DOCX`);
    } else if (isPdf) {
      // Use AI to extract PDF text
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }
      console.log('Extracting PDF content using AI...');
      extractedText = await extractPdfText(arrayBuffer, LOVABLE_API_KEY);
      console.log(`Extracted ${extractedText.length} characters from PDF`);
    } else if (isDoc) {
      // Old .doc format - we can't easily parse this without complex libraries
      // Return a message asking user to convert to DOCX
      return new Response(
        JSON.stringify({ 
          error: 'Old .doc format is not supported. Please save the file as .docx and re-upload.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type for extraction' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!extractedText || extractedText.length < 10) {
      console.error('No text extracted from document');
      return new Response(
        JSON.stringify({ error: 'No text could be extracted from the document. The file may be empty or corrupted.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the material with extracted content using service role
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Truncate if too long (max 100KB)
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

    console.log(`Successfully saved ${truncatedText.length} characters for material ${materialId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentLength: truncatedText.length,
        preview: truncatedText.substring(0, 300) + '...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-document-text:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
