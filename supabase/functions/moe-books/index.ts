import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_HOST = "studentbooks.moe.gov.eg";
const SOURCE_MAX_BYTES = 50 * 1024 * 1024;
const PDF_PART_MAX_BYTES = 5 * 1024 * 1024;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/pdf,image/*,*/*;q=0.8",
  "Accept-Language": "ar,en;q=0.8",
};

const BLOCKED_HOSTS = [
  "localhost",
  "0.0.0.0",
  "169.254.169.254",
  "metadata.google.internal",
  "metadata.azure.internal",
];

const BLOCKED_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

// Accepts any public http(s) URL (not just the ministry site).
function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    const host = u.hostname.toLowerCase();
    if (BLOCKED_HOSTS.includes(host)) return null;
    if (host.endsWith(".local") || host.endsWith(".internal")) return null;
    if (BLOCKED_IP_PATTERNS.some((p) => p.test(host))) return null;
    if (!host.includes(".")) return null;
    return u;
  } catch {
    return null;
  }
}

const SUPPORTED_BINARY: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function htmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function pageTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
}

async function splitPdfByMaxBytes(bytes: Uint8Array, maxBytes: number): Promise<Uint8Array[]> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pageCount = source.getPageCount();
  const parts: Uint8Array[] = [];
  let current = await PDFDocument.create();

  const flush = async () => {
    if (current.getPageCount() === 0) return;
    parts.push(await current.save({ useObjectStreams: true }));
    current = await PDFDocument.create();
  };

  for (let i = 0; i < pageCount; i++) {
    const [page] = await source.copyPages(source, [i]);
    current.addPage(page);

    const candidate = await current.save({ useObjectStreams: true });
    if (candidate.byteLength > maxBytes && current.getPageCount() > 1) {
      current.removePage(current.getPageCount() - 1);
      await flush();

      const [singlePage] = await source.copyPages(source, [i]);
      current.addPage(singlePage);
      const single = await current.save({ useObjectStreams: true });
      if (single.byteLength > maxBytes) {
        throw new Error(`Page ${i + 1} is larger than the maximum extraction part size and cannot be split without altering the PDF.`);
      }
    } else if (candidate.byteLength > maxBytes) {
      throw new Error(`Page ${i + 1} is larger than the maximum extraction part size and cannot be split without altering the PDF.`);
    }
  }

  await flush();
  return parts;
}

function sanitizeName(name: string, fallback: string): string {
  const safe = name
    .replace(/[^\x00-\x7F]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^\w.\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return safe || fallback;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "unauthorized" }, 401);

    const body = await req.json();
    const url = safeUrl(String(body?.url ?? ""));
    if (!url) return json({ error: "invalid_url" }, 400);

    // Download the resource
    let res: Response;
    try {
      res = await fetch(url.href, { headers: BROWSER_HEADERS, redirect: "follow" });
    } catch (e) {
      console.error("fetch failed", String(e));
      return json({ error: "source_unavailable" }, 200);
    }
    if (!res.ok) {
      console.warn("source responded", res.status);
      return json({ error: "source_unavailable", status: res.status }, 200);
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const ext = (url.pathname.split(".").pop() || "").toLowerCase();
    const isHtml = contentType.includes("text/html") || contentType.includes("application/xhtml");

    // Case 1: a web page -> convert to text and store as a material
    if (isHtml && !SUPPORTED_BINARY[ext]) {
      const html = await res.text();
      const text = htmlToText(html);
      if (text.length < 40) return json({ error: "no_readable_content" }, 200);

      const title = pageTitle(html) || url.hostname;
      const fileName = `${title.slice(0, 80)}.txt`;
      const storagePath = `${user.id}/${Date.now()}_web_${sanitizeName(title.slice(0, 40), "page")}.txt`;
      const bytes = new TextEncoder().encode(
        `${title}\n${url.href}\n\n${text.slice(0, 400000)}`,
      );

      const { error: uploadError } = await supabase.storage
        .from("learning-materials")
        .upload(storagePath, bytes, { contentType: "text/plain; charset=utf-8", upsert: false });
      if (uploadError) {
        console.error("upload failed", uploadError.message);
        return json({ error: "upload_failed" }, 500);
      }

      const { data: material, error: insertError } = await supabase
        .from("uploaded_materials")
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_type: "text/plain",
          file_size: bytes.byteLength,
          storage_path: storagePath,
          content: text.slice(0, 400000),
        })
        .select()
        .single();

      if (insertError) {
        console.error("insert failed", insertError.message);
        return json({ error: "save_failed" }, 500);
      }
      return json({ material, kind: "webpage" });
    }

    // Case 2: a downloadable file (pdf / word / text / image)
    const buffer = new Uint8Array(await res.arrayBuffer());
    if (buffer.byteLength === 0) return json({ error: "empty_file" }, 200);
    if (buffer.byteLength > SOURCE_MAX_BYTES) {
      return json({
        error: "file_too_large",
        maxMb: SOURCE_MAX_BYTES / (1024 * 1024),
        actualMb: Number((buffer.byteLength / (1024 * 1024)).toFixed(1))
      }, 200);
    }

    let fileType = SUPPORTED_BINARY[ext];
    if (!fileType) {
      if (contentType.includes("pdf")) fileType = "application/pdf";
      else if (contentType.startsWith("image/")) fileType = contentType.split(";")[0];
      else if (contentType.includes("word")) fileType = SUPPORTED_BINARY.docx;
      else if (contentType.startsWith("text/")) fileType = "text/plain";
    }
    if (!fileType) return json({ error: "unsupported_type" }, 200);

    const rawName = decodeURIComponent(url.pathname.split("/").pop() || "") ||
      `${url.hostname}.${ext || "bin"}`;
    const storagePath = `${user.id}/${Date.now()}_url_${sanitizeName(rawName, "file")}`;

    const { error: uploadError } = await supabase.storage
      .from("learning-materials")
      .upload(storagePath, buffer, { contentType: fileType, upsert: false });
    if (uploadError) {
      console.error("upload failed", uploadError.message);
      return json({ error: "upload_failed" }, 500);
    }

    const { data: material, error: insertError } = await supabase
      .from("uploaded_materials")
      .insert({
        user_id: user.id,
        file_name: rawName,
        file_type: fileType,
        file_size: buffer.byteLength,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (insertError) {
      console.error("insert failed", insertError.message);
      return json({ error: "save_failed" }, 500);
    }

    // Large PDFs are kept intact as the user's reference file, while extraction
    // uses temporary <=5MB PDF parts. The client extracts those parts in sequence
    // and combines their text back into the original material.
    if (fileType === "application/pdf" && buffer.byteLength > PDF_PART_MAX_BYTES) {
      try {
        const partBytes = await splitPdfByMaxBytes(buffer, PDF_PART_MAX_BYTES);
        const parts: Array<{
          id: string;
          storage_path: string;
          file_type: string;
          file_name: string;
          index: number;
          total: number;
        }> = [];

        const baseName = rawName.replace(/\.pdf$/i, "");

        for (let i = 0; i < partBytes.length; i++) {
          const partName = `${baseName}.part-${String(i + 1).padStart(3, "0")}-of-${String(partBytes.length).padStart(3, "0")}.pdf`;
          const partPath = `${user.id}/${Date.now()}_url_part_${String(i + 1).padStart(3, "0")}_${sanitizeName(partName, "part.pdf")}`;

          const { error: partUploadError } = await supabase.storage
            .from("learning-materials")
            .upload(partPath, partBytes[i], { contentType: "application/pdf", upsert: false });

          if (partUploadError) {
            console.error("part upload failed", partUploadError.message);
            return json({ error: "split_upload_failed" }, 500);
          }

          const { data: partMaterial, error: partInsertError } = await supabase
            .from("uploaded_materials")
            .insert({
              user_id: user.id,
              file_name: partName,
              file_type: "application/pdf",
              file_size: partBytes[i].byteLength,
              storage_path: partPath,
            })
            .select("id, storage_path, file_type, file_name")
            .single();

          if (partInsertError || !partMaterial) {
            console.error("part insert failed", partInsertError?.message);
            return json({ error: "split_save_failed" }, 500);
          }

          parts.push({
            id: partMaterial.id,
            storage_path: partMaterial.storage_path,
            file_type: partMaterial.file_type,
            file_name: partMaterial.file_name,
            index: i + 1,
            total: partBytes.length,
          });
        }

        return json({
          material,
          kind: "file",
          split: true,
          partCount: parts.length,
          parts,
        });
      } catch (splitError) {
        console.error("PDF split failed", splitError);
        await supabase.storage.from("learning-materials").remove([storagePath]);
        await supabase.from("uploaded_materials").delete().eq("id", material.id);
        return json({
          error: "pdf_split_failed",
          message: splitError instanceof Error ? splitError.message : "PDF splitting failed"
        }, 200);
      }
    }

    return json({ material, kind: "file", split: false });
  } catch (error) {
    console.error("import-from-url error:", error);
    return json({ error: "request_failed" }, 500);
  }
});
