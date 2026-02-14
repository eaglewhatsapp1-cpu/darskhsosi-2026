import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { SidebarFeature } from '@/components/LearningPlatform';

export const useUserProgress = (featureId: SidebarFeature) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch progress for this feature
    const fetchProgress = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_progress')
                .select('progress_data')
                .eq('user_id', user.id)
                .eq('feature_id', featureId)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setProgress(data.progress_data);
            }
        } catch (error) {
            console.error(`Error fetching progress for ${featureId}:`, error);
        } finally {
            setLoading(false);
        }
    }, [user, featureId]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    // Save progress for this feature
    const saveProgress = async (newData: any) => {
        if (!user) return { error: new Error('Not authenticated') };

        try {
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    feature_id: featureId,
                    progress_data: newData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,feature_id'
                });

            if (error) throw error;
            setProgress(newData);
            return { success: true };
        } catch (error) {
            console.error(`Error saving progress for ${featureId}:`, error);
            return { error };
        }
    };

    return { progress, loading, saveProgress, refreshProgress: fetchProgress };
};
