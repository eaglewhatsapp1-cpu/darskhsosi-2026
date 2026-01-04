import React, { useState } from 'react';
import { useLearner } from '@/contexts/LearnerContext';
import ProfileSetup from './ProfileSetup';
import AppSidebar from './AppSidebar';
import MainContent from './MainContent';

const LearningPlatform: React.FC = () => {
  const { isProfileComplete } = useLearner();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isProfileComplete) {
    return <ProfileSetup />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <MainContent />
    </div>
  );
};

export default LearningPlatform;
