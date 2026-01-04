import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import ProfileSetup from './ProfileSetup';
import AppSidebar from './AppSidebar';
import MainContent from './MainContent';
import { Loader2 } from 'lucide-react';

type SidebarFeature = 'teacher' | 'upload' | 'mindmap' | 'simplify' | 'summary' | 'scientist' | 'video' | 'test' | 'progress';

const LearningPlatform: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, isProfileComplete, fetchProfile } = useProfile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeFeature, setActiveFeature] = useState<SidebarFeature>('teacher');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguage(profile.preferred_language);
      document.documentElement.dir = profile.preferred_language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = profile.preferred_language;
    }
  }, [profile]);

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const handleProfileComplete = () => {
    fetchProfile();
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isProfileComplete) {
    return (
      <ProfileSetup 
        onComplete={handleProfileComplete}
        currentLanguage={language}
        setLanguage={handleLanguageChange}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        profile={profile!}
        language={language}
        onSignOut={signOut}
      />
      <MainContent 
        activeFeature={activeFeature}
        profile={profile!}
        language={language}
        setActiveFeature={setActiveFeature}
      />
    </div>
  );
};

export default LearningPlatform;
