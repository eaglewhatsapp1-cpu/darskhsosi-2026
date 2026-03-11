import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  GraduationCap, Upload, Network, Sparkles, Layers, ClipboardCheck,
  ChevronLeft, ChevronRight, X, MessageSquare, Brain, FileText,
  Lightbulb, Video, FlaskConical, Link, FolderKanban
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingTourProps {
  language: 'ar' | 'en';
  onComplete: () => void;
  onNavigate?: (feature: string) => void;
}

interface TourStep {
  icon: React.ElementType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  color: string;
  targetSelector?: string;
  targetFeature?: string;
  actionAr?: string;
  actionEn?: string;
}

const steps: TourStep[] = [
  {
    icon: GraduationCap,
    titleAr: 'مرحباً بك في درس خصوصي! 🎓',
    titleEn: 'Welcome to Dars Khusoosi! 🎓',
    descAr: 'منصتك التعليمية الذكية المدعومة بالذكاء الاصطناعي. دعنا نأخذك في جولة سريعة لتتعرف على كل المزايا.',
    descEn: 'Your AI-powered smart learning platform. Let us give you a quick tour of all features.',
    color: 'from-primary to-primary/80',
  },
  {
    icon: Upload,
    titleAr: 'ارفع موادك الدراسية 📚',
    titleEn: 'Upload Your Materials 📚',
    descAr: 'ابدأ برفع ملفات PDF، Word، PowerPoint أو صور. سيقوم الذكاء الاصطناعي بتحليلها واستخدامها في جميع الأدوات.',
    descEn: 'Start by uploading PDF, Word, PowerPoint files or images. AI will analyze and use them across all tools.',
    color: 'from-blue-500 to-cyan-500',
    targetSelector: '[data-helper-target="sidebar-upload"]',
    targetFeature: 'upload',
    actionAr: 'رفع المواد',
    actionEn: 'Upload Materials',
  },
  {
    icon: Sparkles,
    titleAr: 'المعلم الذكي 🤖',
    titleEn: 'Intelligent Teacher 🤖',
    descAr: 'اسأل أي سؤال واحصل على إجابات مخصصة بناءً على مستواك وأسلوب تعلمك وموادك الدراسية.',
    descEn: 'Ask any question and get personalized answers based on your level, learning style, and materials.',
    color: 'from-purple-500 to-pink-500',
    targetSelector: '[data-helper-target="sidebar-teacher"]',
    targetFeature: 'teacher',
    actionAr: 'بدء المحادثة',
    actionEn: 'Start Chat',
  },
  {
    icon: Brain,
    titleAr: 'الخرائط الذهنية 🧠',
    titleEn: 'Mind Maps 🧠',
    descAr: 'أنشئ خرائط ذهنية تفاعلية من موادك لتنظيم الأفكار والمفاهيم بصرياً.',
    descEn: 'Create interactive mind maps from your materials to organize ideas and concepts visually.',
    color: 'from-violet-500 to-purple-500',
    targetSelector: '[data-helper-target="sidebar-mindmap"]',
    targetFeature: 'mindmap',
  },
  {
    icon: Lightbulb,
    titleAr: 'تبسيط المفاهيم 💡',
    titleEn: 'Simplify Concepts 💡',
    descAr: 'ألصق أي نص صعب وسيتم تبسيطه بطريقة سهلة الفهم مناسبة لمستواك.',
    descEn: 'Paste any difficult text and it will be simplified in an easy-to-understand way for your level.',
    color: 'from-yellow-500 to-amber-500',
    targetSelector: '[data-helper-target="sidebar-simplify"]',
    targetFeature: 'simplify',
  },
  {
    icon: FileText,
    titleAr: 'الملخصات 📝',
    titleEn: 'Summaries 📝',
    descAr: 'احصل على ملخصات شاملة ومنظمة من موادك الدراسية بضغطة زر.',
    descEn: 'Get comprehensive, organized summaries from your study materials with one click.',
    color: 'from-teal-500 to-cyan-500',
    targetSelector: '[data-helper-target="sidebar-summary"]',
    targetFeature: 'summary',
  },
  {
    icon: Layers,
    titleAr: 'البطاقات التعليمية 🃏',
    titleEn: 'Smart Flashcards 🃏',
    descAr: 'أنشئ بطاقات تعليمية تلقائياً من موادك الدراسية لمراجعة فعالة وسريعة.',
    descEn: 'Auto-generate flashcards from your materials for effective and quick review.',
    color: 'from-amber-500 to-orange-500',
    targetSelector: '[data-helper-target="sidebar-flashcards"]',
    targetFeature: 'flashcards',
  },
  {
    icon: ClipboardCheck,
    titleAr: 'اختبارات الفهم ✅',
    titleEn: 'Understanding Tests ✅',
    descAr: 'اختبر مدى فهمك بأسئلة متنوعة يولدها الذكاء الاصطناعي من موادك.',
    descEn: 'Test your understanding with diverse AI-generated questions from your materials.',
    color: 'from-green-500 to-emerald-500',
    targetSelector: '[data-helper-target="sidebar-test"]',
    targetFeature: 'test',
  },
  {
    icon: FlaskConical,
    titleAr: 'تحدث مع عالم 🔬',
    titleEn: 'Talk to a Scientist 🔬',
    descAr: 'تحدث مع شخصيات علمية تاريخية مثل أينشتاين وابن سينا واطرح عليهم أسئلتك.',
    descEn: 'Chat with historical scientists like Einstein and Ibn Sina and ask them your questions.',
    color: 'from-indigo-500 to-blue-500',
    targetSelector: '[data-helper-target="sidebar-scientist"]',
    targetFeature: 'scientist',
  },
  {
    icon: Video,
    titleAr: 'التعلم بالفيديو 🎬',
    titleEn: 'Video Learning 🎬',
    descAr: 'شاهد فيديو YouTube واسأل المعلم الذكي عن محتواه للشرح والتوضيح.',
    descEn: 'Watch a YouTube video and ask the AI teacher about its content for explanation.',
    color: 'from-red-500 to-rose-500',
    targetSelector: '[data-helper-target="sidebar-video"]',
    targetFeature: 'video',
  },
  {
    icon: Link,
    titleAr: 'شارح الروابط 🔗',
    titleEn: 'Link Explainer 🔗',
    descAr: 'ألصق أي رابط ويب وسيقوم الذكاء الاصطناعي بشرح محتواه لك.',
    descEn: 'Paste any web link and AI will explain its content for you.',
    color: 'from-sky-500 to-blue-500',
    targetSelector: '[data-helper-target="sidebar-weblink"]',
    targetFeature: 'weblink',
  },
  {
    icon: GraduationCap,
    titleAr: 'الخطة الدراسية 📅',
    titleEn: 'Study Plan 📅',
    descAr: 'دع الذكاء الاصطناعي يساعدك في إنشاء خطة دراسية مخصصة ومنظمة.',
    descEn: 'Let AI help you create a personalized and organized study plan.',
    color: 'from-orange-500 to-amber-500',
    targetSelector: '[data-helper-target="sidebar-studyplan"]',
    targetFeature: 'studyplan',
  },
  {
    icon: FolderKanban,
    titleAr: 'مشاريع مقترحة 💼',
    titleEn: 'Suggested Projects 💼',
    descAr: 'احصل على أفكار مشاريع تطبيقية مرتبطة بموادك لتعزيز التعلم العملي.',
    descEn: 'Get practical project ideas related to your materials to enhance hands-on learning.',
    color: 'from-emerald-500 to-green-500',
    targetSelector: '[data-helper-target="sidebar-projects"]',
    targetFeature: 'projects',
  },
  {
    icon: Network,
    titleAr: 'أنت جاهز! 🚀',
    titleEn: "You're Ready! 🚀",
    descAr: 'ابدأ بتحميل موادك الدراسية، ثم استكشف الأدوات المختلفة. تعلم سعيد!',
    descEn: 'Start by uploading your materials, then explore the tools. Happy learning!',
    color: 'from-primary to-accent',
    actionAr: 'ابدأ التعلم',
    actionEn: 'Start Learning',
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ language, onComplete, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;

  // Update spotlight position
  const updateSpotlight = useCallback(() => {
    if (!step.targetSelector) {
      setSpotlightPos(null);
      return;
    }
    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    } else {
      setSpotlightPos(null);
    }
  }, [step.targetSelector]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [updateSpotlight]);

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('floatingHelperSeen', 'true');
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('floatingHelperSeen', 'true');
    onComplete();
  };

  const handleAction = () => {
    if (step.targetFeature && onNavigate) {
      onNavigate(step.targetFeature);
    }
    handleSkip();
  };

  return (
    <>
      {/* Spotlight overlay */}
      {spotlightPos && (
        <>
          <div
            className="fixed inset-0 z-[51] pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(
                ellipse at ${spotlightPos.left + spotlightPos.width / 2}px ${spotlightPos.top + spotlightPos.height / 2}px,
                transparent ${Math.max(spotlightPos.width, spotlightPos.height) / 2 + 20}px,
                rgba(0, 0, 0, 0.5) ${Math.max(spotlightPos.width, spotlightPos.height) / 2 + 60}px
              )`
            }}
          />
          <div
            className="fixed z-[51] pointer-events-none border-2 border-primary rounded-lg animate-pulse"
            style={{
              top: spotlightPos.top - 4,
              left: spotlightPos.left - 4,
              width: spotlightPos.width + 8,
              height: spotlightPos.height + 8,
            }}
          />
        </>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-[52] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir={dir}>
        <Card className="w-full max-w-md p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-300">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 end-3 text-muted-foreground"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className={cn(
              'w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-gradient-to-br',
              step.color,
            )}>
              <Icon className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              {language === 'ar' ? step.titleAr : step.titleEn}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
              {language === 'ar' ? step.descAr : step.descEn}
            </p>

            {/* Step counter */}
            <div className="text-xs text-muted-foreground mb-3">
              {currentStep + 1} / {steps.length}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              {currentStep > 0 ? (
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(prev => prev - 1)}>
                  {language === 'ar' ? <ChevronRight className="w-4 h-4 ml-1" /> : <ChevronLeft className="w-4 h-4 mr-1" />}
                  {language === 'ar' ? 'السابق' : 'Back'}
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                  {language === 'ar' ? 'تخطي' : 'Skip'}
                </Button>
              )}

              <div className="flex gap-2">
                {step.actionAr && step.targetFeature && (
                  <Button variant="outline" size="sm" onClick={handleAction}>
                    {language === 'ar' ? step.actionAr : step.actionEn}
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {isLast
                    ? (language === 'ar' ? 'ابدأ التعلم' : 'Start Learning')
                    : (language === 'ar' ? 'التالي' : 'Next')}
                  {!isLast && (language === 'ar' ? <ChevronLeft className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 ml-1" />)}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default OnboardingTour;
