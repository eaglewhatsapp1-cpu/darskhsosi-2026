import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import ChatWrapper from './chat/ChatWrapper';
import { Loader2 } from 'lucide-react';

interface ProjectSuggestionsProps {
  language: 'ar' | 'en';
}

const ProjectSuggestions: React.FC<ProjectSuggestionsProps> = ({ language }) => {
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatWrapper
        personaId="projects"
        profile={profile}
        language={language}
        showMaterialSelector={true}
        showTempUpload={true}
        showExport={true}
        showSuggestions={true}
      />
    </div>
  );
};

export default ProjectSuggestions;
