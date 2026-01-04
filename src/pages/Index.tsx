import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LearnerProvider } from '@/contexts/LearnerContext';
import LearningPlatform from '@/components/LearningPlatform';

const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <LearnerProvider>
        <LearningPlatform />
      </LearnerProvider>
    </LanguageProvider>
  );
};

export default Index;
