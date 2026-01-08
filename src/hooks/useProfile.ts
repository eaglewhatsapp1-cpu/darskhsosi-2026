import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  birth_date: string | null;
  education_level: 'elementary' | 'middle' | 'high' | 'university' | 'professional' | null;
  learning_style: 'visual' | 'practical' | 'illustrative' | null;
  interests: string[] | null;
  bio: string | null;
  preferred_language: 'ar' | 'en';
  avatar_url: string | null;
  subject: string | null;
  knowledge_ratio: number | null;
  speaking_style: 'formal_ar' | 'colloquial_ar' | 'en' | 'mixed' | null;
  ai_persona: 'teacher' | 'scientist' | 'examiner' | 'analyzer' | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data as Profile);
      } else {
        // Create profile if it doesn't exist (fallback for trigger failure)
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
            preferred_language: 'ar'
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          setProfile(newProfile as Profile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data as Profile);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const isProfileComplete = profile && 
    profile.education_level && 
    profile.learning_style;

  return { profile, loading, updateProfile, fetchProfile, isProfileComplete };
};
