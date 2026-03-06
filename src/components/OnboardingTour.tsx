import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Upload, Network, Sparkles, Layers, ClipboardCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingTourProps {
  language: 'ar' | 'en';
  onComplete: () => void;
}

const steps = [
  {
    icon: GraduationCap,
    titleAr: 'مرحباً بك في درس خصوصي! 🎓',
    titleEn: 'Welcome to Dars Khusoosi! 🎓',
    descAr: 'منصتك التعليمية الذكية المدعومة بالذكاء الاصطناعي. دعنا نأخذك في جولة سريعة.',
    descEn: 'Your AI-powered smart learning platform. Let us give you a quick tour.',
    color: 'from-primary to-primary/80',
  },
  {
    icon: Upload,
    titleAr: 'ارفع موادك الدراسية 📚',
    titleEn: 'Upload Your Materials 📚',
    descAr: 'ارفع ملفات PDF، Word، أو أي مستندات. سيقوم الذكاء الاصطناعي بتحليلها واستخدامها في جميع الأدوات.',
    descEn: 'Upload PDF, Word, or any documents. AI will analyze and use them across all tools.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    titleAr: 'المعلم الذكي 🤖',
    titleEn: 'Intelligent Teacher 🤖',
    descAr: 'اسأل أي سؤال واحصل على إجابات مخصصة بناءً على مستواك وأسلوب تعلمك.',
    descEn: 'Ask any question and get personalized answers based on your level and learning style.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Network,
    titleAr: 'أدوات متعددة 🛠️',
    titleEn: 'Multiple Tools 🛠️',
    descAr: 'خرائط ذهنية، ملخصات، تبسيط مفاهيم، اختبارات فهم، وخطط دراسية - كلها في مكان واحد.',
    descEn: 'Mind maps, summaries, concept simplification, quizzes, and study plans - all in one place.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Layers,
    titleAr: 'بطاقات تعليمية ذكية 🃏',
    titleEn: 'Smart Flashcards 🃏',
    descAr: 'أنشئ بطاقات تعليمية تلقائياً من موادك الدراسية لمراجعة فعالة.',
    descEn: 'Auto-generate flashcards from your materials for effective review.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: ClipboardCheck,
    titleAr: 'أنت جاهز! 🚀',
    titleEn: "You're Ready! 🚀",
    descAr: 'ابدأ بتحميل موادك الدراسية، ثم استكشف الأدوات المختلفة. تعلم سعيد!',
    descEn: 'Start by uploading your materials, then explore the tools. Happy learning!',
    color: 'from-primary to-accent',
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ language, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir={dir}>
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
            'w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br',
            step.color,
          )}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-3">
            {language === 'ar' ? step.titleAr : step.titleEn}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            {language === 'ar' ? step.descAr : step.descEn}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === currentStep ? 'w-6 bg-primary' : 'bg-muted-foreground/30',
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                {language === 'ar' ? <ChevronRight className="w-4 h-4 ml-1" /> : <ChevronLeft className="w-4 h-4 mr-1" />}
                {t('السابق', 'Back')}
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                {t('تخطي', 'Skip')}
              </Button>
            )}

            <Button onClick={handleNext}>
              {isLast ? t('ابدأ التعلم', 'Start Learning') : t('التالي', 'Next')}
              {!isLast && (language === 'ar' ? <ChevronLeft className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 ml-1" />)}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingTour;
