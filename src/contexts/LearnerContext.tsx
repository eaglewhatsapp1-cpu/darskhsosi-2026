import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LearnerProfile, Subject, ChatMessage, SidebarFeature } from '@/types/learner';

interface LearnerContextType {
  profile: LearnerProfile | null;
  setProfile: (profile: LearnerProfile) => void;
  subjects: Subject[];
  addSubject: (subject: Subject) => void;
  currentSubject: Subject | null;
  setCurrentSubject: (subject: Subject | null) => void;
  addMessage: (subjectId: string, message: ChatMessage) => void;
  activeFeature: SidebarFeature;
  setActiveFeature: (feature: SidebarFeature) => void;
  uploadedMaterials: string[];
  addUploadedMaterial: (material: string) => void;
  isProfileComplete: boolean;
}

const LearnerContext = createContext<LearnerContextType | undefined>(undefined);

export const LearnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<LearnerProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [activeFeature, setActiveFeature] = useState<SidebarFeature>('teacher');
  const [uploadedMaterials, setUploadedMaterials] = useState<string[]>([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('dars-profile');
    const savedSubjects = localStorage.getItem('dars-subjects');
    const savedMaterials = localStorage.getItem('dars-materials');

    if (savedProfile) {
      setProfileState(JSON.parse(savedProfile));
    }
    if (savedSubjects) {
      const parsed = JSON.parse(savedSubjects);
      setSubjects(parsed);
      if (parsed.length > 0) {
        setCurrentSubject(parsed[0]);
      }
    }
    if (savedMaterials) {
      setUploadedMaterials(JSON.parse(savedMaterials));
    }
  }, []);

  const setProfile = (newProfile: LearnerProfile) => {
    setProfileState(newProfile);
    localStorage.setItem('dars-profile', JSON.stringify(newProfile));
  };

  const addSubject = (subject: Subject) => {
    const updated = [...subjects, subject];
    setSubjects(updated);
    localStorage.setItem('dars-subjects', JSON.stringify(updated));
  };

  const addMessage = (subjectId: string, message: ChatMessage) => {
    const updated = subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, messages: [...s.messages, message] };
      }
      return s;
    });
    setSubjects(updated);
    localStorage.setItem('dars-subjects', JSON.stringify(updated));
    
    if (currentSubject?.id === subjectId) {
      setCurrentSubject(updated.find(s => s.id === subjectId) || null);
    }
  };

  const addUploadedMaterial = (material: string) => {
    const updated = [...uploadedMaterials, material];
    setUploadedMaterials(updated);
    localStorage.setItem('dars-materials', JSON.stringify(updated));
  };

  const isProfileComplete = profile !== null;

  return (
    <LearnerContext.Provider
      value={{
        profile,
        setProfile,
        subjects,
        addSubject,
        currentSubject,
        setCurrentSubject,
        addMessage,
        activeFeature,
        setActiveFeature,
        uploadedMaterials,
        addUploadedMaterial,
        isProfileComplete,
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export const useLearner = () => {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
};
