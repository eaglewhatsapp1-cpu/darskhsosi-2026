import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SidebarFeature } from '@/types/learner';
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

const featureIcons: Record<string, React.ElementType> = {
  mindmap: Network,
  simplify: Lightbulb,
  summary: FileText,
  scientist: Users,
  video: Video,
  test: ClipboardCheck,
};

const featureDescriptions: Record<string, { ar: string; en: string }> = {
  mindmap: {
    ar: 'إنشاء خرائط ذهنية تفاعلية من المواد التعليمية المرفوعة',
    en: 'Create interactive mind maps from uploaded learning materials',
  },
  simplify: {
    ar: 'تبسيط المفاهيم المعقدة بطريقة سهلة الفهم',
    en: 'Simplify complex concepts in an easy-to-understand way',
  },
  summary: {
    ar: 'الحصول على ملخصات شاملة للمواد التعليمية',
    en: 'Get comprehensive summaries of learning materials',
  },
  scientist: {
    ar: 'محادثة تفاعلية مع شخصيات علمية تاريخية',
    en: 'Interactive conversation with historical scientific figures',
  },
  video: {
    ar: 'التعلم من خلال مقاطع فيديو يوتيوب مع محادثة متزامنة',
    en: 'Learn through YouTube videos with synchronized chat',
  },
  test: {
    ar: 'اختبارات تفاعلية لقياس مستوى الفهم والتقدم',
    en: 'Interactive tests to measure understanding and progress',
  },
};

interface FeaturePlaceholderProps {
  feature: SidebarFeature;
}

const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({ feature }) => {
  const { t, language } = useLanguage();
  const Icon = featureIcons[feature] || Sparkles;
  const description = featureDescriptions[feature];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6 animate-float">
        <Icon className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {t(`sidebar.${feature}`)}
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-6">
        {description ? description[language] : ''}
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
        {t('sidebar.teacher')}
      </Button>
    </div>
  );
};

export default FeaturePlaceholder;
