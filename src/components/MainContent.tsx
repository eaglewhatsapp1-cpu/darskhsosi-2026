import React from 'react';
import { useLearner } from '@/contexts/LearnerContext';
import ChatInterface from './ChatInterface';
import UploadMaterials from './UploadMaterials';
import LearningProgress from './LearningProgress';
import FeaturePlaceholder from './FeaturePlaceholder';

const MainContent: React.FC = () => {
  const { activeFeature } = useLearner();

  const renderContent = () => {
    switch (activeFeature) {
      case 'teacher':
        return <ChatInterface />;
      case 'upload':
        return <UploadMaterials />;
      case 'progress':
        return <LearningProgress />;
      case 'mindmap':
      case 'simplify':
      case 'summary':
      case 'scientist':
      case 'video':
      case 'test':
        return <FeaturePlaceholder feature={activeFeature} />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <main className="flex-1 h-screen overflow-hidden bg-background geometric-pattern">
      {renderContent()}
    </main>
  );
};

export default MainContent;
