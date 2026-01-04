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

  const addMaterial = async (material: {
    file_name: string;
    file_type?: string;
    file_size?: number;
    storage_path?: string;
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

  return { materials, loading, addMaterial, deleteMaterial, fetchMaterials };
};
