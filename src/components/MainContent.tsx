import React from 'react';
import { Profile } from '@/hooks/useProfile';
import ChatInterface from './ChatInterface';
import UploadMaterials from './UploadMaterials';
import LearningProgress from './LearningProgress';
import FeaturePlaceholder from './FeaturePlaceholder';

type SidebarFeature = 'teacher' | 'upload' | 'mindmap' | 'simplify' | 'summary' | 'scientist' | 'video' | 'test' | 'progress';

interface MainContentProps {
  activeFeature: SidebarFeature;
  profile: Profile;
  language: 'ar' | 'en';
  setActiveFeature: (feature: SidebarFeature) => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeFeature, profile, language, setActiveFeature }) => {
  const handleNavigateToUpload = () => {
    setActiveFeature('upload');
  };

  const renderContent = () => {
    switch (activeFeature) {
      case 'teacher':
        return (
          <ChatInterface 
            profile={profile} 
            language={language}
            onNavigateToUpload={handleNavigateToUpload}
          />
        );
      case 'upload':
        return <UploadMaterials language={language} />;
      case 'progress':
        return <LearningProgress language={language} />;
      case 'mindmap':
      case 'simplify':
      case 'summary':
      case 'scientist':
      case 'video':
      case 'test':
        return <FeaturePlaceholder feature={activeFeature} language={language} />;
      default:
        return (
          <ChatInterface 
            profile={profile} 
            language={language}
            onNavigateToUpload={handleNavigateToUpload}
          />
        );
    }
  };

  return (
    <main className="flex-1 h-screen overflow-hidden bg-background geometric-pattern">
      {renderContent()}
    </main>
  );
};

export default MainContent;
