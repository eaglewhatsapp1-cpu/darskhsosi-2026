import React from 'react';
import { Profile } from '@/hooks/useProfile';
import ChatInterface from './ChatInterface';
import UploadMaterials from './UploadMaterials';
import LearningProgress from './LearningProgress';
import SimplifyFeature from './SimplifyFeature';
import SummaryFeature from './SummaryFeature';
import MindMapFeature from './MindMapFeature';
import ScientistChat from './ScientistChat';
import UnderstandingTest from './UnderstandingTest';
import VideoLearning from './VideoLearning';
import WebLinkExplainer from './WebLinkExplainer';
import StudyPlanGenerator from './StudyPlanGenerator';
import ProjectSuggestions from './ProjectSuggestions';

import { SidebarFeature } from './LearningPlatform';

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
        return <ChatInterface profile={profile} language={language} onNavigateToUpload={handleNavigateToUpload} />;
      case 'upload':
        return <UploadMaterials language={language} />;
      case 'progress':
        return <LearningProgress language={language} />;
      case 'mindmap':
        return <MindMapFeature language={language} />;
      case 'simplify':
        return <SimplifyFeature language={language} />;
      case 'summary':
        return <SummaryFeature language={language} />;
      case 'scientist':
        return <ScientistChat language={language} />;
      case 'video':
        return <VideoLearning language={language} />;
      case 'test':
        return <UnderstandingTest language={language} />;
      case 'weblink':
        return <WebLinkExplainer language={language} profile={profile} />;
      case 'studyplan':
        return <StudyPlanGenerator language={language} profile={profile} />;
      case 'projects':
        return <ProjectSuggestions language={language} />;
      default:
        return <ChatInterface profile={profile} language={language} onNavigateToUpload={handleNavigateToUpload} />;
    }
  };

  return (
    <main className="flex-1 h-full overflow-hidden bg-background geometric-pattern">
      {renderContent()}
    </main>
  );
};

export default MainContent;
