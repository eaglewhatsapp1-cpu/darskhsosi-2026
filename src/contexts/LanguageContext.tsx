import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // App
    'app.name': 'درس خصوصي',
    'app.tagline': 'منصة التعلم المفتوح بالذكاء الاصطناعي',
    'app.welcome': 'مرحباً بك في رحلة التعلم',
    
    // Profile Setup
    'profile.setup': 'إعداد الملف الشخصي',
    'profile.name': 'الاسم',
    'profile.birthDate': 'تاريخ الميلاد',
    'profile.educationLevel': 'المستوى التعليمي',
    'profile.learningStyle': 'أسلوب التعلم',
    'profile.interests': 'الاهتمامات',
    'profile.bio': 'نبذة مختصرة',
    'profile.language': 'اللغة المفضلة',
    'profile.save': 'حفظ الملف الشخصي',
    'profile.picture': 'صورة الملف الشخصي',
    
    // Education Levels
    'education.elementary': 'ابتدائي',
    'education.middle': 'متوسط',
    'education.high': 'ثانوي',
    'education.university': 'جامعي',
    'education.professional': 'مهني',
    
    // Learning Styles
    'style.visual': 'بصري',
    'style.practical': 'عملي',
    'style.illustrative': 'توضيحي',
    
    // Sidebar Features
    'sidebar.teacher': 'المعلم الذكي',
    'sidebar.upload': 'رفع المواد',
    'sidebar.mindmap': 'الخريطة الذهنية',
    'sidebar.simplify': 'تبسيط المفاهيم',
    'sidebar.summary': 'الملخص',
    'sidebar.scientist': 'حديث مع عالم',
    'sidebar.video': 'التعلم بالفيديو',
    'sidebar.test': 'اختبار الفهم',
    'sidebar.progress': 'تقدم التعلم',
    'sidebar.settings': 'الإعدادات',
    
    // Chat
    'chat.placeholder': 'اكتب سؤالك هنا...',
    'chat.send': 'إرسال',
    'chat.thinking': 'يفكر...',
    'chat.welcome': 'مرحباً! أنا معلمك الذكي. كيف يمكنني مساعدتك اليوم؟',
    'chat.uploadFirst': 'يرجى رفع المواد التعليمية أولاً للبدء في التعلم.',
    
    // Actions
    'action.cancel': 'إلغاء',
    'action.confirm': 'تأكيد',
    'action.export': 'تصدير',
    'action.upload': 'رفع',
    'action.start': 'ابدأ',
    
    // Languages
    'lang.ar': 'العربية',
    'lang.en': 'English',
  },
  en: {
    // App
    'app.name': 'Dars Khusoosi',
    'app.tagline': 'AI-Powered Open Learning Platform',
    'app.welcome': 'Welcome to Your Learning Journey',
    
    // Profile Setup
    'profile.setup': 'Profile Setup',
    'profile.name': 'Name',
    'profile.birthDate': 'Birth Date',
    'profile.educationLevel': 'Education Level',
    'profile.learningStyle': 'Learning Style',
    'profile.interests': 'Interests',
    'profile.bio': 'Short Bio',
    'profile.language': 'Preferred Language',
    'profile.save': 'Save Profile',
    'profile.picture': 'Profile Picture',
    
    // Education Levels
    'education.elementary': 'Elementary',
    'education.middle': 'Middle School',
    'education.high': 'High School',
    'education.university': 'University',
    'education.professional': 'Professional',
    
    // Learning Styles
    'style.visual': 'Visual',
    'style.practical': 'Practical',
    'style.illustrative': 'Illustrative',
    
    // Sidebar Features
    'sidebar.teacher': 'Intelligent Teacher',
    'sidebar.upload': 'Upload Materials',
    'sidebar.mindmap': 'Mind Map',
    'sidebar.simplify': 'Simplify Concept',
    'sidebar.summary': 'Summary',
    'sidebar.scientist': 'Talk to Scientist',
    'sidebar.video': 'Learn with Video',
    'sidebar.test': 'Understanding Test',
    'sidebar.progress': 'Learning Progress',
    'sidebar.settings': 'Settings',
    
    // Chat
    'chat.placeholder': 'Type your question here...',
    'chat.send': 'Send',
    'chat.thinking': 'Thinking...',
    'chat.welcome': 'Hello! I am your intelligent teacher. How can I help you today?',
    'chat.uploadFirst': 'Please upload learning materials first to start learning.',
    
    // Actions
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.export': 'Export',
    'action.upload': 'Upload',
    'action.start': 'Start',
    
    // Languages
    'lang.ar': 'العربية',
    'lang.en': 'English',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('dars-language') as Language;
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('dars-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
