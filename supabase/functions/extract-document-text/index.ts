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

// Extract text from PDF using Gemini Vision with enhanced OCR
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
      model: 'google/gemini-2.5-pro',
      messages: [
        {
          role: 'system',
          content: `You are an advanced document OCR and text extraction specialist. Your task is to extract ALL text content from documents with perfect accuracy.

CRITICAL EXTRACTION RULES:
1. Extract EVERY word, number, symbol, and character exactly as it appears
2. Preserve the EXACT structure: headings, paragraphs, lists, tables, footnotes
3. Maintain proper reading order (left-to-right, top-to-bottom for LTR; right-to-left for RTL like Arabic)
4. For tables: preserve structure using markdown table format or clear spacing
5. For mathematical equations: use LaTeX notation where applicable
6. For Arabic/RTL text: maintain correct character order and diacritics (تشكيل)
7. For mixed language documents: preserve each language's text correctly
8. Include ALL captions, headers, footers, page numbers, and marginalia
9. For handwritten text: transcribe as accurately as possible, mark uncertain words with [?]
10. For diagrams/charts: describe content in [FIGURE: description] format

NEVER:
- Summarize or paraphrase - extract VERBATIM
- Skip "unimportant" sections like footnotes or references
- Add your own commentary or explanations
- Translate content to another language

OUTPUT FORMAT:
Return ONLY the extracted text, preserving original formatting and structure.
This extraction is for a RAG knowledge base system that requires complete, accurate content.`
        },
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Extract ALL text from this PDF document. Return the complete, verbatim text preserving all structure, formatting, and reading order. Do not summarize or skip any content.' 
            },
            {
              type: 'image_url',
              image_url: { url: dataUri }
            }
          ]
        }
      ],
      max_tokens: 32000,
      temperature: 0.1,
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
    
    // File size validation (10MB limit)
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
    // Return generic error to client, keep details in server logs
    return new Response(
      JSON.stringify({ error: 'Unable to process document. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
