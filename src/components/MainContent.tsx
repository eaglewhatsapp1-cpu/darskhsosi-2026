import React, { useEffect, useRef } from 'react';
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
import gsap from 'gsap';

import { SidebarFeature } from './LearningPlatform';

interface MainContentProps {
  activeFeature: SidebarFeature;
  profile: Profile;
  language: 'ar' | 'en';
  setActiveFeature: (feature: SidebarFeature) => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeFeature, profile, language, setActiveFeature }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFeature = useRef<SidebarFeature | null>(null);

  const handleNavigateToUpload = () => {
    setActiveFeature('upload');
  };

  // GSAP page transition animation
  useEffect(() => {
    if (!contentRef.current) return;

    // Only animate if feature changed
    if (previousFeature.current !== activeFeature) {
      const ctx = gsap.context(() => {
        // Animate content in
        gsap.fromTo(
          contentRef.current,
          { 
            opacity: 0, 
            y: 30,
            scale: 0.98
          },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.5, 
            ease: 'power3.out'
          }
        );

        // Animate children with stagger
        const children = contentRef.current?.querySelectorAll('.gsap-stagger-child');
        if (children && children.length > 0) {
          gsap.fromTo(
            children,
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.4, 
              stagger: 0.08,
              delay: 0.2,
              ease: 'power2.out'
            }
          );
        }
      });

      previousFeature.current = activeFeature;
      return () => ctx.revert();
    }
  }, [activeFeature]);

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
    <main className="flex-1 h-full overflow-hidden bg-background geometric-pattern gsap-theme-animate">
      <div ref={contentRef} className="h-full">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContent;
