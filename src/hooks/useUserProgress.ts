import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { SidebarFeature } from '@/components/LearningPlatform';

export const useUserProgress = (featureId: SidebarFeature) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const storageKey = user ? `progress_${user.id}_${featureId}` : null;

    const fetchProgress = useCallback(async () => {
        if (!storageKey) { setLoading(false); return; }
        try {
            setLoading(true);
            const stored = localStorage.getItem(storageKey);
            if (stored) setProgress(JSON.parse(stored));
        } catch (error) {
            console.error(`Error fetching progress for ${featureId}:`, error);
        } finally {
            setLoading(false);
        }
    }, [storageKey, featureId]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    const saveProgress = async (newData: any) => {
        if (!storageKey) return { error: new Error('Not authenticated') };
        try {
            localStorage.setItem(storageKey, JSON.stringify(newData));
            setProgress(newData);
            return { success: true };
        } catch (error) {
            console.error(`Error saving progress for ${featureId}:`, error);
            return { error };
        }
    };

    return { progress, loading, saveProgress, refreshProgress: fetchProgress };
};
