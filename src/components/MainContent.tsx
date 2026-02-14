import React, { useRef, useLayoutEffect } from 'react';
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
import { cn } from '@/lib/utils';

interface MainContentProps {
  activeFeature: SidebarFeature;
  profile: Profile;
  language: 'ar' | 'en';
  setActiveFeature: (feature: SidebarFeature) => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeFeature, profile, language, setActiveFeature }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Keep track of which features have been visited to avoid rendering everything at once
  // but keep them in DOM once visited to persist their state.
  const [visitedFeatures, setVisitedFeatures] = React.useState<Set<SidebarFeature>>(new Set([activeFeature]));

  React.useEffect(() => {
    setVisitedFeatures(prev => {
      if (prev.has(activeFeature)) return prev;
      const next = new Set(prev);
      next.add(activeFeature);
      return next;
    });
  }, [activeFeature]);

  const handleNavigateToUpload = () => {
    setActiveFeature('upload');
  };

  // GSAP page transition animation
  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    gsap.killTweensOf(element);
    gsap.fromTo(
      element,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, [activeFeature]);

  const features: { id: SidebarFeature; component: React.ReactNode }[] = [
    { id: 'teacher', component: <ChatInterface profile={profile} language={language} onNavigateToUpload={handleNavigateToUpload} /> },
    { id: 'upload', component: <UploadMaterials language={language} /> },
    { id: 'progress', component: <LearningProgress language={language} /> },
    { id: 'mindmap', component: <MindMapFeature language={language} /> },
    { id: 'simplify', component: <SimplifyFeature language={language} /> },
    { id: 'summary', component: <SummaryFeature language={language} /> },
    { id: 'scientist', component: <ScientistChat language={language} /> },
    { id: 'video', component: <VideoLearning language={language} /> },
    { id: 'test', component: <UnderstandingTest language={language} /> },
    { id: 'weblink', component: <WebLinkExplainer language={language} profile={profile} /> },
    { id: 'studyplan', component: <StudyPlanGenerator language={language} profile={profile} /> },
    { id: 'projects', component: <ProjectSuggestions language={language} /> }
  ];

  return (
    <main className="flex-1 h-full overflow-hidden bg-background gsap-theme-animate">
      <div ref={contentRef} className="h-full relative">
        {features.map((feature) => (
          visitedFeatures.has(feature.id) && (
            <div
              key={feature.id}
              className={cn(
                "h-full w-full absolute inset-0 overflow-hidden",
                activeFeature === feature.id ? "z-10 opacity-100 pointer-events-auto" : "z-0 opacity-0 pointer-events-none"
              )}
            >
              {feature.component}
            </div>
          )
        ))}

        {/* Fallback for undefined features */}
        {!features.find(f => f.id === activeFeature) && (
          <div className="h-full w-full flex items-center justify-center">
            <ChatInterface profile={profile} language={language} onNavigateToUpload={handleNavigateToUpload} />
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
