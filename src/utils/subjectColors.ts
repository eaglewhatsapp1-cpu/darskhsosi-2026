// Subject color system for visual differentiation
export type Subject = 
  | 'physics' 
  | 'chemistry' 
  | 'math' 
  | 'biology' 
  | 'history' 
  | 'arabic' 
  | 'english' 
  | 'general';

export interface SubjectTheme {
  id: Subject;
  nameAr: string;
  nameEn: string;
  icon: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

export const subjectThemes: Record<Subject, SubjectTheme> = {
  physics: {
    id: 'physics',
    nameAr: 'الفيزياء',
    nameEn: 'Physics',
    icon: '⚛️',
    primary: 'hsl(220, 90%, 50%)',
    secondary: 'hsl(220, 85%, 95%)',
    accent: 'hsl(220, 90%, 60%)',
    gradient: 'linear-gradient(135deg, hsl(220, 90%, 50%), hsl(200, 90%, 55%))',
  },
  chemistry: {
    id: 'chemistry',
    nameAr: 'الكيمياء',
    nameEn: 'Chemistry',
    icon: '🧪',
    primary: 'hsl(160, 84%, 39%)',
    secondary: 'hsl(160, 80%, 95%)',
    accent: 'hsl(160, 84%, 49%)',
    gradient: 'linear-gradient(135deg, hsl(160, 84%, 39%), hsl(140, 80%, 45%))',
  },
  math: {
    id: 'math',
    nameAr: 'الرياضيات',
    nameEn: 'Mathematics',
    icon: '📐',
    primary: 'hsl(270, 70%, 55%)',
    secondary: 'hsl(270, 65%, 95%)',
    accent: 'hsl(270, 70%, 65%)',
    gradient: 'linear-gradient(135deg, hsl(270, 70%, 55%), hsl(290, 70%, 60%))',
  },
  biology: {
    id: 'biology',
    nameAr: 'الأحياء',
    nameEn: 'Biology',
    icon: '🌿',
    primary: 'hsl(120, 60%, 45%)',
    secondary: 'hsl(120, 55%, 95%)',
    accent: 'hsl(120, 60%, 55%)',
    gradient: 'linear-gradient(135deg, hsl(120, 60%, 45%), hsl(100, 60%, 50%))',
  },
  history: {
    id: 'history',
    nameAr: 'التاريخ',
    nameEn: 'History',
    icon: '📜',
    primary: 'hsl(35, 80%, 45%)',
    secondary: 'hsl(35, 75%, 95%)',
    accent: 'hsl(35, 80%, 55%)',
    gradient: 'linear-gradient(135deg, hsl(35, 80%, 45%), hsl(25, 80%, 50%))',
  },
  arabic: {
    id: 'arabic',
    nameAr: 'اللغة العربية',
    nameEn: 'Arabic',
    icon: '📖',
    primary: 'hsl(350, 70%, 50%)',
    secondary: 'hsl(350, 65%, 95%)',
    accent: 'hsl(350, 70%, 60%)',
    gradient: 'linear-gradient(135deg, hsl(350, 70%, 50%), hsl(330, 70%, 55%))',
  },
  english: {
    id: 'english',
    nameAr: 'اللغة الإنجليزية',
    nameEn: 'English',
    icon: '🔤',
    primary: 'hsl(210, 80%, 55%)',
    secondary: 'hsl(210, 75%, 95%)',
    accent: 'hsl(210, 80%, 65%)',
    gradient: 'linear-gradient(135deg, hsl(210, 80%, 55%), hsl(190, 80%, 50%))',
  },
  general: {
    id: 'general',
    nameAr: 'عام',
    nameEn: 'General',
    icon: '📚',
    primary: 'hsl(174, 84%, 32%)',
    secondary: 'hsl(174, 80%, 95%)',
    accent: 'hsl(174, 84%, 42%)',
    gradient: 'linear-gradient(135deg, hsl(174, 84%, 32%), hsl(154, 84%, 37%))',
  },
};

export const getSubjectTheme = (subject: string): SubjectTheme => {
  return subjectThemes[subject as Subject] || subjectThemes.general;
};

export const getSubjectName = (subject: string, language: 'ar' | 'en'): string => {
  const theme = getSubjectTheme(subject);
  return language === 'ar' ? theme.nameAr : theme.nameEn;
};

export const getAllSubjects = (): SubjectTheme[] => {
  return Object.values(subjectThemes);
};
