import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UploadedMaterial {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  content: string | null;
  created_at: string;
}

export const useUploadedMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<UploadedMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMaterials();
    } else {
      setMaterials([]);
      setLoading(false);
    }
  }, [user]);

  const fetchMaterials = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('uploaded_materials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data as UploadedMaterial[]);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sanitize filename to remove non-ASCII characters for storage compatibility
  const sanitizeFilename = (filename: string): string => {
    // Get file extension
    const lastDotIndex = filename.lastIndexOf('.');
    const ext = lastDotIndex > -1 ? filename.slice(lastDotIndex) : '';
    const nameWithoutExt = lastDotIndex > -1 ? filename.slice(0, lastDotIndex) : filename;

    // Replace non-ASCII characters with transliteration or underscores
    const sanitized = nameWithoutExt
      .replace(/[^\x00-\x7F]/g, '_') // Replace non-ASCII with underscore
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      || 'file'; // Fallback if empty

    return sanitized + ext;
  };

  const uploadFile = async (file: File): Promise<{ storagePath: string; content: string | null; needsExtraction: boolean; originalFilename: string; fileType: string } | null> => {
    if (!user) return null;

    try {
      const sanitizedName = sanitizeFilename(file.name);
      const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('learning-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      let content: string | null = null;
      let needsExtraction = false;
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js', 'ts', 'py'];

      // For text files, extract content directly
      if (fileExt && textExtensions.includes(fileExt)) {
        content = await file.text();
        if (content.length > 50000) {
          content = content.substring(0, 50000) + '\n\n[Content truncated...]';
        }
      }
      // For PDF, DOCX, DOC, PPTX and Images - need AI extraction
      else if (fileExt && ['pdf', 'docx', 'doc', 'pptx', 'png', 'jpg', 'jpeg', 'webp'].includes(fileExt)) {
        needsExtraction = true;
      }

      return { storagePath: filePath, content, needsExtraction, originalFilename: file.name, fileType: file.type };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const extractDocumentContent = async (materialId: string, storagePath: string, fileType: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Extracting document content:', { materialId, storagePath, fileType });

      const { data, error: invokeError } = await supabase.functions.invoke('extract-document-text', {
        body: { materialId, storagePath, fileType }
      });

      if (invokeError) {
        console.error('Document extraction error:', invokeError);
        return { success: false, error: invokeError.message || 'Function invocation failed' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      console.log('Extraction result:', data);

      // Refresh materials to get the updated content
      await fetchMaterials();
      return { success: true };
    } catch (error: any) {
      console.error('Error extracting document:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  };

  const addMaterial = async (material: {
    file_name: string;
    file_type?: string;
    file_size?: number;
    storage_path?: string;
    content?: string | null;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('uploaded_materials')
        .insert({
          user_id: user.id,
          file_name: material.file_name,
          file_type: material.file_type || null,
          file_size: material.file_size || null,
          storage_path: material.storage_path || null,
          content: material.content || null,
        })
        .select()
        .single();

      if (error) throw error;
      setMaterials((prev) => [data as UploadedMaterial, ...prev]);
      return { data: data as UploadedMaterial, error: null };
    } catch (error) {
      console.error('Error adding material:', error);
      return { data: null, error };
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const material = materials.find(m => m.id === id);

      if (material?.storage_path) {
        await supabase.storage
          .from('learning-materials')
          .remove([material.storage_path]);
      }

      const { error } = await supabase
        .from('uploaded_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting material:', error);
      return { error };
    }
  };

  return { materials, loading, addMaterial, deleteMaterial, fetchMaterials, uploadFile, extractDocumentContent };
};
