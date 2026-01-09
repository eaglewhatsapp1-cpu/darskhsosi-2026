// Centralized Translation System for Dars Khsosy Platform

export type Language = 'ar' | 'en';

export const translations = {
  // App Branding
  'app.name': { ar: 'درس خصوصي', en: 'Dars Khsosy' },
  'app.slogan': { ar: 'مدرسك الذكي المدعوم بخصائص الذكاء الاصطناعي', en: 'Your Smart Learning Assistant' },
  'app.tagline': { ar: 'منصة التعلم المفتوح بالذكاء الاصطناعي', en: 'AI-Powered Open Learning Platform' },
  
  // Landing Page
  'landing.hero.title': { ar: 'تعلم بذكاء مع', en: 'Learn Smarter with' },
  'landing.hero.subtitle': { ar: 'منصتك التعليمية الشخصية المدعومة بالذكاء الاصطناعي', en: 'Your Personal AI-Powered Learning Platform' },
  'landing.hero.cta': { ar: 'ابدأ رحلة التعلم', en: 'Start Learning Journey' },
  'landing.hero.login': { ar: 'تسجيل الدخول', en: 'Sign In' },
  'landing.features.title': { ar: 'مميزات المنصة', en: 'Platform Features' },
  'landing.features.subtitle': { ar: 'أدوات تعليمية متطورة لتجربة تعلم فريدة', en: 'Advanced learning tools for a unique experience' },
  'landing.feature.ai': { ar: 'معلم ذكي', en: 'AI Teacher' },
  'landing.feature.ai.desc': { ar: 'محادثة تفاعلية مع معلم ذكي يفهم احتياجاتك', en: 'Interactive conversation with an AI teacher that understands your needs' },
  'landing.feature.mindmap': { ar: 'خرائط ذهنية', en: 'Mind Maps' },
  'landing.feature.mindmap.desc': { ar: 'حوّل أي موضوع إلى خريطة ذهنية مرئية', en: 'Transform any topic into a visual mind map' },
  'landing.feature.summary': { ar: 'تلخيص ذكي', en: 'Smart Summaries' },
  'landing.feature.summary.desc': { ar: 'احصل على ملخصات شاملة لأي محتوى', en: 'Get comprehensive summaries of any content' },
  'landing.feature.test': { ar: 'اختبارات تفاعلية', en: 'Interactive Tests' },
  'landing.feature.test.desc': { ar: 'اختبر فهمك مع أسئلة مخصصة', en: 'Test your understanding with personalized questions' },
  'landing.feature.simplify': { ar: 'تبسيط المفاهيم', en: 'Simplify Concepts' },
  'landing.feature.simplify.desc': { ar: 'اشرح لي كأنني طفل صغير', en: 'Explain Like I\'m 5' },
  'landing.feature.video': { ar: 'تعلم بالفيديو', en: 'Video Learning' },
  'landing.feature.video.desc': { ar: 'تعلم من يوتيوب مع مساعد ذكي', en: 'Learn from YouTube with an AI assistant' },
  'landing.feature.scientist': { ar: 'حوار مع العلماء', en: 'Chat with Scientists' },
  'landing.feature.scientist.desc': { ar: 'تحدث مع شخصيات علمية تاريخية', en: 'Talk to historical scientific figures' },
  'landing.feature.studyplan': { ar: 'خطة دراسية', en: 'Study Plan' },
  'landing.feature.studyplan.desc': { ar: 'خطة دراسية مخصصة لك', en: 'A personalized study plan for you' },
  'landing.cta.title': { ar: 'ابدأ رحلة التعلم الآن', en: 'Start Your Learning Journey Now' },
  'landing.cta.subtitle': { ar: 'انضم إلى آلاف الطلاب الذين يتعلمون بذكاء', en: 'Join thousands of students learning smarter' },
  'landing.cta.button': { ar: 'أنشئ حسابك مجاناً', en: 'Create Your Free Account' },
  
  // Auth Page
  'auth.login': { ar: 'تسجيل الدخول', en: 'Sign In' },
  'auth.signup': { ar: 'إنشاء حساب جديد', en: 'Create Account' },
  'auth.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.submit.login': { ar: 'تسجيل الدخول', en: 'Sign In' },
  'auth.submit.signup': { ar: 'إنشاء حساب', en: 'Create Account' },
  'auth.toggle.signup': { ar: 'ليس لديك حساب؟ سجل الآن', en: 'Don\'t have an account? Sign up' },
  'auth.toggle.login': { ar: 'لديك حساب؟ سجل دخولك', en: 'Already have an account? Sign in' },
  'auth.error.required': { ar: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور', en: 'Please enter email and password' },
  'auth.error.password': { ar: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', en: 'Password must be at least 6 characters' },
  'auth.error.invalid': { ar: 'بيانات الدخول غير صحيحة', en: 'Invalid login credentials' },
  'auth.error.exists': { ar: 'هذا البريد الإلكتروني مسجل بالفعل', en: 'This email is already registered' },
  'auth.error.generic': { ar: 'حدث خطأ. حاول مرة أخرى.', en: 'An error occurred. Please try again.' },
  'auth.success.signup': { ar: 'تم إنشاء الحساب بنجاح!', en: 'Account created successfully!' },
  
  // Sidebar Features
  'sidebar.teacher': { ar: 'المعلم الذكي', en: 'AI Teacher' },
  'sidebar.upload': { ar: 'رفع المواد', en: 'Upload Materials' },
  'sidebar.mindmap': { ar: 'الخريطة الذهنية', en: 'Mind Map' },
  'sidebar.simplify': { ar: 'تبسيط المفاهيم', en: 'Simplify' },
  'sidebar.summary': { ar: 'تلخيص المحتوى', en: 'Summary' },
  'sidebar.scientist': { ar: 'حوار مع العلماء', en: 'Scientists Chat' },
  'sidebar.video': { ar: 'تعلم بالفيديو', en: 'Video Learning' },
  'sidebar.test': { ar: 'اختبار الفهم', en: 'Understanding Test' },
  'sidebar.progress': { ar: 'تقدم التعلم', en: 'Learning Progress' },
  'sidebar.weblink': { ar: 'شرح الروابط', en: 'Explain Links' },
  'sidebar.studyplan': { ar: 'خطة الدراسة', en: 'Study Plan' },
  'sidebar.projects': { ar: 'المشاريع', en: 'Projects' },
  'sidebar.profile': { ar: 'الملف الشخصي', en: 'Profile' },
  'sidebar.signout': { ar: 'تسجيل الخروج', en: 'Sign Out' },
  
  // Header
  'header.knowledge.label': { ar: 'مصدر المعرفة', en: 'Knowledge Source' },
  'header.knowledge.materials': { ar: '📚 موادي', en: '📚 My Materials' },
  'header.knowledge.internet': { ar: '🌐 الإنترنت', en: '🌐 Internet' },
  
  // Profile Setup
  'profile.setup': { ar: 'إعداد الملف الشخصي', en: 'Profile Setup' },
  'profile.name': { ar: 'الاسم', en: 'Name' },
  'profile.birthDate': { ar: 'تاريخ الميلاد', en: 'Birth Date' },
  'profile.educationLevel': { ar: 'المستوى التعليمي', en: 'Education Level' },
  'profile.learningStyle': { ar: 'أسلوب التعلم', en: 'Learning Style' },
  'profile.interests': { ar: 'الاهتمامات', en: 'Interests' },
  'profile.bio': { ar: 'نبذة مختصرة', en: 'Short Bio' },
  'profile.language': { ar: 'اللغة المفضلة', en: 'Preferred Language' },
  'profile.save': { ar: 'حفظ الملف الشخصي', en: 'Save Profile' },
  'profile.aiPersona': { ar: 'شخصية المعلم', en: 'AI Persona' },
  'profile.speakingStyle': { ar: 'أسلوب التحدث', en: 'Speaking Style' },
  'profile.knowledgeRatio': { ar: 'حدود المعرفة', en: 'Knowledge Boundary' },
  'profile.avatar': { ar: 'الصورة الشخصية', en: 'Profile Photo' },
  
  // Education Levels
  'education.elementary': { ar: 'ابتدائي', en: 'Elementary' },
  'education.middle': { ar: 'متوسط', en: 'Middle School' },
  'education.high': { ar: 'ثانوي', en: 'High School' },
  'education.university': { ar: 'جامعي', en: 'University' },
  'education.professional': { ar: 'مهني', en: 'Professional' },
  
  // Learning Styles
  'style.visual': { ar: 'بصري', en: 'Visual' },
  'style.practical': { ar: 'عملي', en: 'Practical' },
  'style.illustrative': { ar: 'توضيحي', en: 'Illustrative' },
  
  // AI Personas
  'persona.teacher': { ar: 'معلم', en: 'Teacher' },
  'persona.scientist': { ar: 'عالم', en: 'Scientist' },
  'persona.examiner': { ar: 'ممتحن', en: 'Examiner' },
  'persona.analyzer': { ar: 'محلل', en: 'Analyzer' },
  
  // Speaking Styles
  'speaking.formal_ar': { ar: 'عربي فصيح', en: 'Formal Arabic' },
  'speaking.colloquial_ar': { ar: 'عربي عامي', en: 'Colloquial Arabic' },
  'speaking.en': { ar: 'إنجليزي', en: 'English' },
  'speaking.mixed': { ar: 'مختلط', en: 'Mixed' },
  
  // Chat Interface
  'chat.placeholder': { ar: 'اكتب سؤالك هنا...', en: 'Type your question here...' },
  'chat.thinking': { ar: 'يفكر...', en: 'Thinking...' },
  'chat.welcome': { ar: 'مرحباً بك في رحلة التعلم', en: 'Welcome to Your Learning Journey' },
  'chat.upload.prompt': { ar: 'ارفع مواد تعليمية للحصول على تجربة تعلم مخصصة أكثر.', en: 'Upload learning materials for a more personalized learning experience.' },
  'chat.files.count': { ar: 'لديك {count} ملفات مرفوعة. اسألني عن أي شيء!', en: 'You have {count} files uploaded. Ask me anything!' },
  'chat.error.rate': { ar: 'تم تجاوز الحد. حاول مرة أخرى لاحقاً.', en: 'Rate limit exceeded. Please try again later.' },
  'chat.error.limit': { ar: 'انتهى الرصيد. يرجى التحقق من حسابك.', en: 'Usage limit reached. Please check your account.' },
  'chat.error.generic': { ar: 'حدث خطأ في الاتصال', en: 'Connection error occurred' },
  
  // Common Actions
  'action.send': { ar: 'إرسال', en: 'Send' },
  'action.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'action.save': { ar: 'حفظ', en: 'Save' },
  'action.delete': { ar: 'حذف', en: 'Delete' },
  'action.edit': { ar: 'تعديل', en: 'Edit' },
  'action.upload': { ar: 'رفع', en: 'Upload' },
  'action.generate': { ar: 'توليد', en: 'Generate' },
  'action.submit': { ar: 'تأكيد', en: 'Submit' },
  'action.tryAgain': { ar: 'حاول مرة أخرى', en: 'Try Again' },
  
  // Understanding Test
  'test.title': { ar: 'اختبار الفهم', en: 'Understanding Test' },
  'test.subtitle': { ar: 'اختبر فهمك للمادة', en: 'Test your understanding of the material' },
  'test.placeholder': { ar: 'الصق النص الذي تريد إنشاء اختبار له...', en: 'Paste the text you want to create a test for...' },
  'test.generate': { ar: 'أنشئ الاختبار', en: 'Generate Test' },
  'test.selectMaterial': { ar: 'اختر من موادك المرفوعة', en: 'Select from your uploaded materials' },
  'test.orEnterText': { ar: 'أو أدخل نصاً', en: 'Or enter text' },
  'test.submit': { ar: 'تحقق من الإجابات', en: 'Check Answers' },
  'test.correct': { ar: 'صحيح!', en: 'Correct!' },
  'test.incorrect': { ar: 'خطأ', en: 'Incorrect' },
  'test.score': { ar: 'النتيجة', en: 'Score' },
  'test.question': { ar: 'سؤال', en: 'Question' },
  'test.config.title': { ar: 'إعدادات الاختبار', en: 'Test Settings' },
  'test.config.difficulty': { ar: 'مستوى الصعوبة', en: 'Difficulty Level' },
  'test.config.count': { ar: 'عدد الأسئلة', en: 'Number of Questions' },
  'test.config.type': { ar: 'نوع الأسئلة', en: 'Question Type' },
  'test.config.language': { ar: 'لغة الاختبار', en: 'Test Language' },
  'test.difficulty.easy': { ar: 'سهل', en: 'Easy' },
  'test.difficulty.medium': { ar: 'متوسط', en: 'Medium' },
  'test.difficulty.hard': { ar: 'صعب', en: 'Hard' },
  'test.difficulty.mixed': { ar: 'مختلط', en: 'Mixed' },
  'test.type.mcq': { ar: 'اختيار من متعدد', en: 'Multiple Choice' },
  'test.type.truefalse': { ar: 'صح أو خطأ', en: 'True/False' },
  'test.type.short': { ar: 'إجابة قصيرة', en: 'Short Answer' },
  
  // Material Source
  'source.title': { ar: 'مصدر المحتوى', en: 'Content Source' },
  'source.materials': { ar: 'من موادي المرفوعة', en: 'From my uploaded materials' },
  'source.text': { ar: 'إدخال نص يدوي', en: 'Enter text manually' },
  'source.select': { ar: 'اختر المادة', en: 'Select material' },
  
  // Progress
  'progress.title': { ar: 'تقدم التعلم', en: 'Learning Progress' },
  'progress.description': { ar: 'تتبع تقدمك في رحلة التعلم', en: 'Track your learning journey progress' },
  'progress.overall': { ar: 'التقدم العام', en: 'Overall Progress' },
  'progress.hours': { ar: 'ساعات التعلم', en: 'Learning Hours' },
  'progress.streak': { ar: 'سلسلة الأيام', en: 'Day Streak' },
  'progress.materials': { ar: 'المواد المرفوعة', en: 'Uploaded Materials' },
  'progress.achievements': { ar: 'الإنجازات', en: 'Achievements' },
  'progress.tip': { ar: 'نصيحة اليوم', en: 'Tip of the Day' },
  'progress.tipText': { ar: 'حاول مراجعة ما تعلمته خلال الـ 24 ساعة الماضية. المراجعة المتكررة تساعد على تثبيت المعلومات في الذاكرة طويلة المدى.', en: 'Try reviewing what you learned in the last 24 hours. Repeated review helps consolidate information in long-term memory.' },
  
  // Simplify
  'simplify.title': { ar: 'تبسيط المفاهيم', en: 'Simplify Concepts' },
  'simplify.subtitle': { ar: 'اشرح لي كأنني طفل صغير', en: 'Explain Like I\'m 5' },
  'simplify.placeholder': { ar: 'اكتب المفهوم أو الفكرة التي تريد تبسيطها...', en: 'Enter the concept you want simplified...' },
  'simplify.button': { ar: 'بسّط لي', en: 'Simplify' },
  'simplify.result': { ar: 'الشرح المبسط', en: 'Simplified Explanation' },
  
  // Summary
  'summary.title': { ar: 'تلخيص المحتوى', en: 'Summarize Content' },
  'summary.subtitle': { ar: 'احصل على ملخص شامل لأي نص أو مادة', en: 'Get a comprehensive summary of any text or material' },
  'summary.placeholder': { ar: 'الصق النص الذي تريد تلخيصه هنا...', en: 'Paste the text you want to summarize here...' },
  'summary.button': { ar: 'لخّص', en: 'Summarize' },
  'summary.result': { ar: 'الملخص', en: 'Summary' },
  
  // Mind Map
  'mindmap.title': { ar: 'الخريطة الذهنية', en: 'Mind Map' },
  'mindmap.subtitle': { ar: 'حوّل أي موضوع إلى خريطة ذهنية مرئية', en: 'Transform any topic into a visual mind map' },
  'mindmap.placeholder': { ar: 'اكتب الموضوع أو المفهوم الذي تريد تحويله لخريطة ذهنية...', en: 'Enter the topic you want to convert to a mind map...' },
  'mindmap.button': { ar: 'أنشئ الخريطة', en: 'Generate Map' },
  'mindmap.result': { ar: 'الخريطة الذهنية', en: 'Mind Map' },
  
  // Upload
  'upload.title': { ar: 'رفع المواد', en: 'Upload Materials' },
  'upload.subtitle': { ar: 'ارفع ملفاتك التعليمية لتجربة تعلم مخصصة', en: 'Upload your learning materials for a personalized experience' },
  'upload.dropzone': { ar: 'اسحب الملفات هنا أو انقر للاختيار', en: 'Drag files here or click to select' },
  'upload.formats': { ar: 'PDF, Word, TXT, صور', en: 'PDF, Word, TXT, Images' },
  'upload.success': { ar: 'تم رفع الملف بنجاح', en: 'File uploaded successfully' },
  'upload.error': { ar: 'فشل رفع الملف', en: 'Failed to upload file' },
  'upload.delete.success': { ar: 'تم حذف الملف', en: 'File deleted' },
  
  // Profile Page
  'profilePage.title': { ar: 'الملف الشخصي', en: 'Profile' },
  'profilePage.personal': { ar: 'المعلومات الشخصية', en: 'Personal Information' },
  'profilePage.learning': { ar: 'إعدادات التعلم', en: 'Learning Settings' },
  'profilePage.ai': { ar: 'إعدادات الذكاء الاصطناعي', en: 'AI Settings' },
  'profilePage.account': { ar: 'إعدادات الحساب', en: 'Account Settings' },
  
  // Common
  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.error': { ar: 'حدث خطأ', en: 'An error occurred' },
  'common.success': { ar: 'تم بنجاح', en: 'Success' },
  'common.day': { ar: 'يوم', en: 'day' },
  'common.days': { ar: 'أيام', en: 'days' },
} as const;

export type TranslationKey = keyof typeof translations;

export const useTranslation = (language: Language) => {
  const t = (key: TranslationKey, replacements?: Record<string, string | number>): string => {
    const translation = translations[key]?.[language] || key;
    
    if (replacements) {
      return Object.entries(replacements).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, String(v)),
        translation
      );
    }
    
    return translation;
  };
  
  return { t, language };
};

// Helper function for components that don't use hooks
export const getTranslation = (key: TranslationKey, language: Language, replacements?: Record<string, string | number>): string => {
  const translation = translations[key]?.[language] || key;
  
  if (replacements) {
    return Object.entries(replacements).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, String(v)),
      translation
    );
  }
  
  return translation;
};
