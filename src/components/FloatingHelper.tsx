import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HelpCircle, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Upload,
  MessageSquare,
  BookOpen,
  Brain,
  FileText,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingHelperProps {
  language: 'ar' | 'en';
  currentFeature: string;
  onNavigate?: (feature: string) => void;
}

interface HelpStep {
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: React.ReactNode;
  action?: { ar: string; en: string };
  targetFeature?: string;
}

const FloatingHelper: React.FC<FloatingHelperProps> = ({ 
  language, 
  currentFeature,
  onNavigate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenHelper, setHasSeenHelper] = useState(false);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Check if user has seen the helper before
  useEffect(() => {
    const seen = localStorage.getItem('floatingHelperSeen');
    if (!seen) {
      // Auto-open for first-time users after a delay
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
    setHasSeenHelper(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('floatingHelperSeen', 'true');
    setHasSeenHelper(true);
  };

  // Getting started steps
  const gettingStartedSteps: HelpStep[] = [
    {
      title: { ar: 'مرحباً بك! 👋', en: 'Welcome! 👋' },
      description: { 
        ar: 'أنا مساعدك الذكي. سأرشدك خطوة بخطوة لتحقيق أقصى استفادة من المنصة.',
        en: "I'm your smart assistant. I'll guide you step by step to get the most out of the platform."
      },
      icon: <Sparkles className="w-6 h-6 text-primary" />
    },
    {
      title: { ar: 'ارفع موادك الدراسية', en: 'Upload Your Materials' },
      description: { 
        ar: 'ابدأ برفع ملفات PDF أو Word أو صور. سيتم تحليلها لتخصيص تجربة التعلم.',
        en: 'Start by uploading PDF, Word files, or images. They will be analyzed to personalize your learning.'
      },
      icon: <Upload className="w-6 h-6 text-blue-500" />,
      action: { ar: 'رفع المواد', en: 'Upload Materials' },
      targetFeature: 'upload'
    },
    {
      title: { ar: 'تحدث مع المعلم الذكي', en: 'Chat with AI Teacher' },
      description: { 
        ar: 'اسأل أي سؤال عن موادك. المعلم الذكي يفهم مستواك ويشرح بطريقة مناسبة.',
        en: 'Ask any question about your materials. The AI teacher understands your level and explains accordingly.'
      },
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      action: { ar: 'بدء المحادثة', en: 'Start Chat' },
      targetFeature: 'teacher'
    },
    {
      title: { ar: 'استكشف أدوات التعلم', en: 'Explore Learning Tools' },
      description: { 
        ar: 'جرب التبسيط، الملخصات، الخرائط الذهنية، واختبارات الفهم لتعزيز تعلمك.',
        en: 'Try simplification, summaries, mind maps, and understanding tests to enhance your learning.'
      },
      icon: <Brain className="w-6 h-6 text-purple-500" />
    },
    {
      title: { ar: 'أنشئ خطة دراسية', en: 'Create a Study Plan' },
      description: { 
        ar: 'دع الذكاء الاصطناعي يساعدك في تنظيم وقتك وإنشاء خطة دراسية مخصصة.',
        en: 'Let AI help you organize your time and create a personalized study plan.'
      },
      icon: <GraduationCap className="w-6 h-6 text-orange-500" />,
      action: { ar: 'إنشاء خطة', en: 'Create Plan' },
      targetFeature: 'studyplan'
    }
  ];

  // Context-specific tips based on current feature
  const getContextualTips = (): HelpStep[] => {
    const tips: Record<string, HelpStep[]> = {
      teacher: [
        {
          title: { ar: 'نصيحة المعلم الذكي', en: 'AI Teacher Tip' },
          description: { 
            ar: 'اختر مواد محددة من القائمة المنسدلة للحصول على إجابات أكثر دقة.',
            en: 'Select specific materials from the dropdown for more accurate answers.'
          },
          icon: <Lightbulb className="w-5 h-5 text-yellow-500" />
        },
        {
          title: { ar: 'اسأل بوضوح', en: 'Ask Clearly' },
          description: { 
            ar: 'كلما كان سؤالك محدداً، كانت الإجابة أفضل. مثال: "اشرح الفصل الثاني"',
            en: 'The more specific your question, the better the answer. Example: "Explain chapter 2"'
          },
          icon: <MessageSquare className="w-5 h-5 text-green-500" />
        }
      ],
      upload: [
        {
          title: { ar: 'أنواع الملفات', en: 'File Types' },
          description: { 
            ar: 'يمكنك رفع PDF، Word، PowerPoint، وصور. سيتم استخراج النص تلقائياً.',
            en: 'You can upload PDF, Word, PowerPoint, and images. Text will be extracted automatically.'
          },
          icon: <FileText className="w-5 h-5 text-blue-500" />
        },
        {
          title: { ar: 'تنظيم الملفات', en: 'Organize Files' },
          description: { 
            ar: 'سمِّ ملفاتك بأسماء واضحة ليسهل العثور عليها لاحقاً.',
            en: 'Name your files clearly to find them easily later.'
          },
          icon: <BookOpen className="w-5 h-5 text-purple-500" />
        }
      ],
      test: [
        {
          title: { ar: 'اختبار الفهم', en: 'Understanding Test' },
          description: { 
            ar: 'اختر مادة محددة أو ألصق نصاً للحصول على اختبار مخصص.',
            en: 'Select a specific material or paste text for a customized test.'
          },
          icon: <Brain className="w-5 h-5 text-orange-500" />
        },
        {
          title: { ar: 'أنواع الأسئلة', en: 'Question Types' },
          description: { 
            ar: 'يمكنك اختيار أسئلة اختيار من متعدد أو أسئلة نصية أو مزيج منهما.',
            en: 'Choose multiple choice, text questions, or a mix of both.'
          },
          icon: <FileText className="w-5 h-5 text-green-500" />
        }
      ],
      mindmap: [
        {
          title: { ar: 'الخريطة الذهنية', en: 'Mind Map' },
          description: { 
            ar: 'أدخل موضوعاً أو اختر مادة لإنشاء خريطة ذهنية تفاعلية.',
            en: 'Enter a topic or select material to create an interactive mind map.'
          },
          icon: <Brain className="w-5 h-5 text-purple-500" />
        }
      ],
      simplify: [
        {
          title: { ar: 'تبسيط المفاهيم', en: 'Simplify Concepts' },
          description: { 
            ar: 'ألصق أي نص صعب وسيتم تبسيطه بطريقة سهلة الفهم.',
            en: 'Paste any difficult text and it will be simplified for easy understanding.'
          },
          icon: <Lightbulb className="w-5 h-5 text-yellow-500" />
        }
      ],
      summary: [
        {
          title: { ar: 'التلخيص الذكي', en: 'Smart Summary' },
          description: { 
            ar: 'اختر مادة أو ألصق نصاً للحصول على ملخص شامل.',
            en: 'Select material or paste text to get a comprehensive summary.'
          },
          icon: <FileText className="w-5 h-5 text-blue-500" />
        }
      ],
      studyplan: [
        {
          title: { ar: 'خطة الدراسة', en: 'Study Plan' },
          description: { 
            ar: 'حدد المادة ومدة الخطة وسيتم إنشاء جدول مفصل لك.',
            en: 'Specify the subject and duration, and a detailed schedule will be created for you.'
          },
          icon: <GraduationCap className="w-5 h-5 text-orange-500" />
        }
      ]
    };

    return tips[currentFeature] || tips.teacher;
  };

  const contextualTips = getContextualTips();
  const steps = hasSeenHelper ? contextualTips : gettingStartedSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.targetFeature && onNavigate) {
      onNavigate(step.targetFeature);
      handleClose();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-50 w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-300 hover:scale-110",
          language === 'ar' ? 'left-4 bottom-4' : 'right-4 bottom-4'
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <HelpCircle className="w-6 h-6 text-primary-foreground animate-pulse" />
        )}
      </Button>

      {/* Helper Card */}
      {isOpen && (
        <Card 
          className={cn(
            "fixed z-50 w-80 shadow-2xl animate-in slide-in-from-bottom-5",
            "bg-card/95 backdrop-blur-lg border-primary/20",
            language === 'ar' ? 'left-4 bottom-20' : 'right-4 bottom-20'
          )}
          dir={dir}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {steps[currentStep].icon}
                <CardTitle className="text-base">
                  {steps[currentStep].title[language]}
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {steps[currentStep].description[language]}
            </p>

            {/* Action Button */}
            {steps[currentStep].action && (
              <Button 
                onClick={handleAction}
                className="w-full gradient-primary"
                size="sm"
              >
                {steps[currentStep].action[language]}
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-1"
              >
                {language === 'ar' ? (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    {language === 'ar' ? 'السابق' : 'Previous'}
                  </>
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </>
                )}
              </Button>
              
              {/* Step Indicators */}
              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      idx === currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="gap-1"
              >
                {currentStep === steps.length - 1 ? (
                  language === 'ar' ? 'إنهاء' : 'Finish'
                ) : language === 'ar' ? (
                  <>
                    {language === 'ar' ? 'التالي' : 'Next'}
                    <ChevronLeft className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FloatingHelper;
