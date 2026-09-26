// Subject color system for visual differentiation
export type Subject = 
  | 'physics' 
  | 'chemistry' 
  | 'math' 
  | 'biology' 
  | 'history' 
  | 'arabic' 
  | 'english' 
  | 'french' | 'german' | 'italian'
  | 'science' | 'social_studies' | 'geography' | 'religion' | 'ict'
  | 'philosophy' | 'critical_thinking' | 'psychology' | 'skills' | 'discover'
  | 'civic_education' | 'advanced_math' | 'applied_physics' | 'applied_chemistry'
  | 'political_geography' | 'computer_ai' | 'statistics' | 'economics' | 'business' | 'entrepreneurship'
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
  french: { id: 'french', nameAr: 'اللغة الفرنسية', nameEn: 'French', icon: '🇫🇷', primary: 'hsl(215, 80%, 55%)', secondary: 'hsl(215, 75%, 95%)', accent: 'hsl(215, 80%, 65%)', gradient: 'linear-gradient(135deg, hsl(215, 80%, 55%), hsl(280, 70%, 60%))' },
  german: { id: 'german', nameAr: 'اللغة الألمانية', nameEn: 'German', icon: '🇩🇪', primary: 'hsl(45, 85%, 45%)', secondary: 'hsl(45, 80%, 95%)', accent: 'hsl(45, 85%, 55%)', gradient: 'linear-gradient(135deg, hsl(45, 85%, 45%), hsl(20, 80%, 50%))' },
  italian: { id: 'italian', nameAr: 'اللغة الإيطالية', nameEn: 'Italian', icon: '🇮🇹', primary: 'hsl(145, 65%, 42%)', secondary: 'hsl(145, 60%, 95%)', accent: 'hsl(145, 65%, 52%)', gradient: 'linear-gradient(135deg, hsl(145, 65%, 42%), hsl(350, 65%, 50%))' },
  science: { id: 'science', nameAr: 'العلوم', nameEn: 'Science', icon: '🔬', primary: 'hsl(160, 70%, 42%)', secondary: 'hsl(160, 65%, 95%)', accent: 'hsl(190, 75%, 55%)', gradient: 'linear-gradient(135deg, hsl(160, 70%, 42%), hsl(190, 75%, 55%))' },
  social_studies: { id: 'social_studies', nameAr: 'الدراسات الاجتماعية', nameEn: 'Social Studies', icon: '🌍', primary: 'hsl(28, 75%, 48%)', secondary: 'hsl(28, 70%, 95%)', accent: 'hsl(42, 80%, 55%)', gradient: 'linear-gradient(135deg, hsl(28, 75%, 48%), hsl(42, 80%, 55%))' },
  geography: { id: 'geography', nameAr: 'الجغرافيا', nameEn: 'Geography', icon: '🗺️', primary: 'hsl(175, 70%, 38%)', secondary: 'hsl(175, 65%, 95%)', accent: 'hsl(195, 75%, 50%)', gradient: 'linear-gradient(135deg, hsl(175, 70%, 38%), hsl(195, 75%, 50%))' },
  religion: { id: 'religion', nameAr: 'التربية الدينية', nameEn: 'Religious Education', icon: '🕌', primary: 'hsl(145, 55%, 38%)', secondary: 'hsl(145, 50%, 95%)', accent: 'hsl(105, 50%, 48%)', gradient: 'linear-gradient(135deg, hsl(145, 55%, 38%), hsl(105, 50%, 48%))' },
  ict: { id: 'ict', nameAr: 'تكنولوجيا المعلومات والاتصالات', nameEn: 'ICT', icon: '💻', primary: 'hsl(205, 85%, 48%)', secondary: 'hsl(205, 80%, 95%)', accent: 'hsl(250, 80%, 60%)', gradient: 'linear-gradient(135deg, hsl(205, 85%, 48%), hsl(250, 80%, 60%))' },
  philosophy: { id: 'philosophy', nameAr: 'الفلسفة والمنطق', nameEn: 'Philosophy & Logic', icon: '🤔', primary: 'hsl(265, 55%, 48%)', secondary: 'hsl(265, 50%, 95%)', accent: 'hsl(290, 60%, 60%)', gradient: 'linear-gradient(135deg, hsl(265, 55%, 48%), hsl(290, 60%, 60%))' },
  critical_thinking: { id: 'critical_thinking', nameAr: 'التفكير الناقد', nameEn: 'Critical Thinking', icon: '🧠', primary: 'hsl(250, 60%, 48%)', secondary: 'hsl(250, 55%, 95%)', accent: 'hsl(320, 60%, 58%)', gradient: 'linear-gradient(135deg, hsl(250, 60%, 48%), hsl(320, 60%, 58%))' },
  psychology: { id: 'psychology', nameAr: 'علم النفس والاجتماع', nameEn: 'Psychology & Sociology', icon: '🧠', primary: 'hsl(320, 65%, 52%)', secondary: 'hsl(320, 60%, 95%)', accent: 'hsl(350, 70%, 60%)', gradient: 'linear-gradient(135deg, hsl(320, 65%, 52%), hsl(350, 70%, 60%))' },
  skills: { id: 'skills', nameAr: 'المهارات المهنية', nameEn: 'Professional Skills', icon: '🛠️', primary: 'hsl(38, 85%, 45%)', secondary: 'hsl(38, 80%, 95%)', accent: 'hsl(25, 85%, 52%)', gradient: 'linear-gradient(135deg, hsl(38, 85%, 45%), hsl(25, 85%, 52%))' },
  discover: { id: 'discover', nameAr: 'اكتشف', nameEn: 'Discover', icon: '🌱', primary: 'hsl(105, 55%, 42%)', secondary: 'hsl(105, 50%, 95%)', accent: 'hsl(80, 65%, 52%)', gradient: 'linear-gradient(135deg, hsl(105, 55%, 42%), hsl(80, 65%, 52%))' },
  civic_education: { id: 'civic_education', nameAr: 'التربية الوطنية والمواطنة', nameEn: 'Civic Education', icon: '🇪🇬', primary: 'hsl(8, 70%, 48%)', secondary: 'hsl(8, 65%, 95%)', accent: 'hsl(45, 80%, 52%)', gradient: 'linear-gradient(135deg, hsl(8, 70%, 48%), hsl(45, 80%, 52%))' },
  advanced_math: { id: 'advanced_math', nameAr: 'الرياضيات المتقدمة', nameEn: 'Advanced Mathematics', icon: '📐', primary: 'hsl(285, 65%, 50%)', secondary: 'hsl(285, 60%, 95%)', accent: 'hsl(225, 75%, 58%)', gradient: 'linear-gradient(135deg, hsl(285, 65%, 50%), hsl(225, 75%, 58%))' },
  applied_physics: { id: 'applied_physics', nameAr: 'الفيزياء التطبيقية', nameEn: 'Applied Physics', icon: '⚛️', primary: 'hsl(200, 80%, 45%)', secondary: 'hsl(200, 75%, 95%)', accent: 'hsl(180, 70%, 48%)', gradient: 'linear-gradient(135deg, hsl(200, 80%, 45%), hsl(180, 70%, 48%))' },
  applied_chemistry: { id: 'applied_chemistry', nameAr: 'الكيمياء التطبيقية', nameEn: 'Applied Chemistry', icon: '🧪', primary: 'hsl(150, 70%, 40%)', secondary: 'hsl(150, 65%, 95%)', accent: 'hsl(80, 65%, 48%)', gradient: 'linear-gradient(135deg, hsl(150, 70%, 40%), hsl(80, 65%, 48%))' },
  political_geography: { id: 'political_geography', nameAr: 'الجغرافيا السياسية والتنمية', nameEn: 'Political Geography & Development', icon: '🗺️', primary: 'hsl(185, 70%, 40%)', secondary: 'hsl(185, 65%, 95%)', accent: 'hsl(35, 75%, 52%)', gradient: 'linear-gradient(135deg, hsl(185, 70%, 40%), hsl(35, 75%, 52%))' },
  computer_ai: { id: 'computer_ai', nameAr: 'علوم الحاسب والذكاء الاصطناعي', nameEn: 'Computer Science & AI', icon: '🤖', primary: 'hsl(235, 75%, 55%)', secondary: 'hsl(235, 70%, 95%)', accent: 'hsl(180, 75%, 50%)', gradient: 'linear-gradient(135deg, hsl(235, 75%, 55%), hsl(180, 75%, 50%))' },
  statistics: { id: 'statistics', nameAr: 'الإحصاء', nameEn: 'Statistics', icon: '📊', primary: 'hsl(215, 65%, 45%)', secondary: 'hsl(215, 60%, 95%)', accent: 'hsl(190, 70%, 52%)', gradient: 'linear-gradient(135deg, hsl(215, 65%, 45%), hsl(190, 70%, 52%))' },
  economics: { id: 'economics', nameAr: 'الاقتصاد', nameEn: 'Economics', icon: '📈', primary: 'hsl(125, 55%, 38%)', secondary: 'hsl(125, 50%, 95%)', accent: 'hsl(160, 60%, 45%)', gradient: 'linear-gradient(135deg, hsl(125, 55%, 38%), hsl(160, 60%, 45%))' },
  business: { id: 'business', nameAr: 'إدارة الأعمال', nameEn: 'Business Management', icon: '💼', primary: 'hsl(220, 55%, 42%)', secondary: 'hsl(220, 50%, 95%)', accent: 'hsl(205, 65%, 52%)', gradient: 'linear-gradient(135deg, hsl(220, 55%, 42%), hsl(205, 65%, 52%))' },
  entrepreneurship: { id: 'entrepreneurship', nameAr: 'ريادة الأعمال', nameEn: 'Entrepreneurship', icon: '🚀', primary: 'hsl(15, 80%, 48%)', secondary: 'hsl(15, 75%, 95%)', accent: 'hsl(35, 85%, 52%)', gradient: 'linear-gradient(135deg, hsl(15, 80%, 48%), hsl(35, 85%, 52%))' },
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

/* ---------------------------------------------------------------
 * Subject visual identity tokens
 * Each subject drives the whole app palette (light + dark).
 * ------------------------------------------------------------- */

interface SubjectHue {
  hue: number;
  sat: number;
  hue2: number; // secondary hue used for gradients
}

const subjectHues: Record<Subject, SubjectHue> = {
  physics: { hue: 220, sat: 90, hue2: 200 },
  chemistry: { hue: 160, sat: 84, hue2: 140 },
  math: { hue: 270, sat: 70, hue2: 290 },
  biology: { hue: 120, sat: 60, hue2: 100 },
  history: { hue: 35, sat: 80, hue2: 25 },
  arabic: { hue: 350, sat: 70, hue2: 330 },
  english: { hue: 210, sat: 80, hue2: 190 },
  french: { hue: 215, sat: 80, hue2: 280 },
  german: { hue: 45, sat: 85, hue2: 20 },
  italian: { hue: 145, sat: 65, hue2: 350 },
  science: { hue: 160, sat: 70, hue2: 190 },
  social_studies: { hue: 28, sat: 75, hue2: 42 },
  geography: { hue: 175, sat: 70, hue2: 195 },
  religion: { hue: 145, sat: 55, hue2: 105 },
  ict: { hue: 205, sat: 85, hue2: 250 },
  philosophy: { hue: 265, sat: 55, hue2: 290 },
  critical_thinking: { hue: 250, sat: 60, hue2: 320 },
  psychology: { hue: 320, sat: 65, hue2: 350 },
  skills: { hue: 38, sat: 85, hue2: 25 },
  discover: { hue: 105, sat: 55, hue2: 80 },
  civic_education: { hue: 8, sat: 70, hue2: 45 },
  advanced_math: { hue: 285, sat: 65, hue2: 225 },
  applied_physics: { hue: 200, sat: 80, hue2: 180 },
  applied_chemistry: { hue: 150, sat: 70, hue2: 80 },
  political_geography: { hue: 185, sat: 70, hue2: 35 },
  computer_ai: { hue: 235, sat: 75, hue2: 180 },
  statistics: { hue: 215, sat: 65, hue2: 190 },
  economics: { hue: 125, sat: 55, hue2: 160 },
  business: { hue: 220, sat: 55, hue2: 205 },
  entrepreneurship: { hue: 15, sat: 80, hue2: 35 },
  general: { hue: 174, sat: 84, hue2: 154 },
};

export type SubjectTokens = Record<string, string>;

export const getSubjectTokens = (subject: string, isDark: boolean): SubjectTokens => {
  const s = (subjectThemes[subject as Subject] ? subject : 'general') as Subject;
  const { hue, sat, hue2 } = subjectHues[s];
  const h = `${hue}`;
  const sa = `${sat}%`;

  if (isDark) {
    return {
      '--primary': `${h} ${sa} 62%`,
      '--primary-foreground': `${h} 60% 10%`,
      '--accent': `${h} 45% 18%`,
      '--accent-foreground': `${h} ${sa} 70%`,
      '--ring': `${h} ${sa} 62%`,
      '--header-bg': `${h} 45% 12%`,
      '--header-foreground': `${h} 25% 96%`,
      '--header-muted': `${h} 15% 75%`,
      '--sidebar-background': `${h} 20% 9%`,
      '--sidebar-primary': `${h} ${sa} 62%`,
      '--sidebar-primary-foreground': `${h} 60% 10%`,
      '--sidebar-accent': `${h} 30% 18%`,
      '--sidebar-accent-foreground': `${h} 40% 92%`,
      '--sidebar-ring': `${h} ${sa} 62%`,
      '--chart-1': `${h} ${sa} 62%`,
      '--chart-2': `${hue2} ${sa} 60%`,
      '--chart-3': `${(hue + 40) % 360} 70% 60%`,
      '--chart-4': `${(hue + 320) % 360} 65% 60%`,
      '--subject-gradient': `linear-gradient(135deg, hsl(${hue}, ${sat}%, 52%), hsl(${hue2}, ${sat}%, 45%))`,
      '--shadow-glow': `0 0 30px hsl(${hue} ${sat}% 55% / 0.35)`,
    };
  }

  return {
    '--primary': `${h} ${sa} 42%`,
    '--primary-foreground': `${h} 40% 98%`,
    '--accent': `${h} 60% 94%`,
    '--accent-foreground': `${h} ${sa} 30%`,
    '--ring': `${h} ${sa} 42%`,
    '--header-bg': `${h} 45% 18%`,
    '--header-foreground': `${h} 25% 96%`,
    '--header-muted': `${h} 18% 82%`,
    '--sidebar-background': `${h} 30% 95%`,
    '--sidebar-primary': `${h} ${sa} 42%`,
    '--sidebar-primary-foreground': `${h} 40% 98%`,
    '--sidebar-accent': `${h} 40% 88%`,
    '--sidebar-accent-foreground': `${h} ${sa} 22%`,
    '--sidebar-ring': `${h} ${sa} 42%`,
    '--chart-1': `${h} ${sa} 45%`,
    '--chart-2': `${hue2} ${sat}% 45%`,
    '--chart-3': `${(hue + 40) % 360} 70% 50%`,
    '--chart-4': `${(hue + 320) % 360} 65% 50%`,
    '--subject-gradient': `linear-gradient(135deg, hsl(${hue}, ${sat}%, 42%), hsl(${hue2}, ${sat}%, 38%))`,
    '--shadow-glow': `0 0 30px hsl(${hue} ${sat}% 42% / 0.25)`,
  };
};
