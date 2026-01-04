export interface LearnerProfile {
  name: string;
  birthDate: string;
  educationLevel: 'elementary' | 'middle' | 'high' | 'university' | 'professional';
  learningStyle: 'visual' | 'practical' | 'illustrative';
  interests: string[];
  bio: string;
  preferredLanguage: 'ar' | 'en';
  profilePicture?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface Subject {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface LearningProgress {
  subjectId: string;
  strengths: string[];
  weaknesses: string[];
  completedTopics: number;
  totalTopics: number;
  lastActivity: string;
}

export type SidebarFeature = 
  | 'teacher'
  | 'upload'
  | 'mindmap'
  | 'simplify'
  | 'summary'
  | 'scientist'
  | 'video'
  | 'test'
  | 'progress';
