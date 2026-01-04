import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Network,
  Lightbulb,
  FileText,
  Users,
  Video,
  ClipboardCheck,
  Sparkles,
  Construction,
} from 'lucide-react';

type SidebarFeature = 'teacher' | 'upload' | 'mindmap' | 'simplify' | 'summary' | 'scientist' | 'video' | 'test' | 'progress';

const featureIcons: Record<string, React.ElementType> = {
  mindmap: Network,
  simplify: Lightbulb,
  summary: FileText,
  scientist: Users,
  video: Video,
  test: ClipboardCheck,
};

interface FeaturePlaceholderProps {
  feature: SidebarFeature;
  language: 'ar' | 'en';
}

const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({ feature, language }) => {
  const Icon = featureIcons[feature] || Sparkles;

  const featureLabels: Record<string, Record<string, string>> = {
    ar: {
      mindmap: 'الخريطة الذهنية',
      simplify: 'تبسيط المفاهيم',
      summary: 'الملخص',
      scientist: 'حديث مع عالم',
      video: 'التعلم بالفيديو',
      test: 'اختبار الفهم',
    },
    en: {
      mindmap: 'Mind Map',
      simplify: 'Simplify Concept',
      summary: 'Summary',
      scientist: 'Talk to Scientist',
      video: 'Learn with Video',
      test: 'Understanding Test',
    },
  };

  const featureDescriptions: Record<string, Record<string, string>> = {
    ar: {
      mindmap: 'إنشاء خرائط ذهنية تفاعلية من المواد التعليمية المرفوعة',
      simplify: 'تبسيط المفاهيم المعقدة بطريقة سهلة الفهم',
      summary: 'الحصول على ملخصات شاملة للمواد التعليمية',
      scientist: 'محادثة تفاعلية مع شخصيات علمية تاريخية',
      video: 'التعلم من خلال مقاطع فيديو يوتيوب مع محادثة متزامنة',
      test: 'اختبارات تفاعلية لقياس مستوى الفهم والتقدم',
    },
    en: {
      mindmap: 'Create interactive mind maps from uploaded learning materials',
      simplify: 'Simplify complex concepts in an easy-to-understand way',
      summary: 'Get comprehensive summaries of learning materials',
      scientist: 'Interactive conversation with historical scientific figures',
      video: 'Learn through YouTube videos with synchronized chat',
      test: 'Interactive tests to measure understanding and progress',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6 animate-float">
        <Icon className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {featureLabels[language][feature]}
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-6">
        {featureDescriptions[language][feature]}
      </p>

      <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent">
        <Construction className="w-4 h-4" />
        <span className="text-sm font-medium">
          {language === 'ar' ? 'قيد التطوير' : 'Coming Soon'}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mt-6 max-w-sm">
        {language === 'ar' 
          ? 'هذه الميزة قيد التطوير وستكون متاحة قريباً. استخدم المعلم الذكي في الوقت الحالي.'
          : 'This feature is under development and will be available soon. Use the Intelligent Teacher for now.'}
      </p>

      <Button className="mt-6 gradient-primary" size="lg">
        <Sparkles className="w-5 h-5 me-2" />
        {language === 'ar' ? 'المعلم الذكي' : 'Intelligent Teacher'}
      </Button>
    </div>
  );
};

export default FeaturePlaceholder;
