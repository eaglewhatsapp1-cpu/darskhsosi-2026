import React from 'react';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import {
  TrendingUp,
  Star,
  Target,
  Lightbulb,
  BookOpen,
  Award,
  Clock,
} from 'lucide-react';

interface LearningProgressProps {
  language: 'ar' | 'en';
}

const LearningProgress: React.FC<LearningProgressProps> = ({ language }) => {
  const { materials, loading } = useUploadedMaterials();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        'sidebar.progress': 'تقدم التعلم',
        'progress.description': 'تتبع تقدمك في رحلة التعلم',
        'progress.overall': 'التقدم العام',
        'progress.completed': 'أكملت',
        'progress.of': 'من',
        'progress.topics': 'موضوعاً',
        'progress.hours': 'ساعات التعلم',
        'progress.streak': 'سلسلة الأيام',
        'progress.days': 'أيام',
        'progress.materials': 'المواد المرفوعة',
        'progress.achievements': 'الإنجازات',
        'progress.strengths': 'نقاط القوة',
        'progress.improve': 'مجالات للتحسين',
        'progress.tip': 'نصيحة اليوم',
        'progress.tipText': 'حاول مراجعة ما تعلمته خلال الـ 24 ساعة الماضية. المراجعة المتكررة تساعد على تثبيت المعلومات في الذاكرة طويلة المدى.',
        'progress.noData': 'ابدأ التعلم لرؤية تقدمك هنا',
      },
      en: {
        'sidebar.progress': 'Learning Progress',
        'progress.description': 'Track your learning journey progress',
        'progress.overall': 'Overall Progress',
        'progress.completed': 'Completed',
        'progress.of': 'of',
        'progress.topics': 'topics',
        'progress.hours': 'Learning Hours',
        'progress.streak': 'Day Streak',
        'progress.days': 'days',
        'progress.materials': 'Uploaded Materials',
        'progress.achievements': 'Achievements',
        'progress.strengths': 'Strengths',
        'progress.improve': 'Areas to Improve',
        'progress.tip': 'Tip of the Day',
        'progress.tipText': 'Try reviewing what you learned in the last 24 hours. Repeated review helps consolidate information in long-term memory.',
        'progress.noData': 'Start learning to see your progress here',
      },
    };
    return translations[language][key] || key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate basic stats from actual data
  const totalMaterials = materials.length;
  const progressPercentage = totalMaterials > 0 ? Math.min(totalMaterials * 10, 100) : 0;

  return (
    <div className="flex flex-col h-full p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          {t('sidebar.progress')}
        </h2>
        <p className="text-muted-foreground mt-2">{t('progress.description')}</p>
      </div>

      {/* Main Progress Card */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-foreground">{t('progress.overall')}</span>
          <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3 mb-4" />
        <p className="text-sm text-muted-foreground">
          {totalMaterials > 0 
            ? (language === 'ar' ? `لديك ${totalMaterials} ملفات تعليمية` : `You have ${totalMaterials} learning materials`)
            : t('progress.noData')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">{t('progress.hours')}</span>
          </div>
          <span className="text-2xl font-bold text-foreground">0</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{t('progress.streak')}</span>
          </div>
          <span className="text-2xl font-bold text-foreground">1 {language === 'ar' ? 'يوم' : 'day'}</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">{t('progress.materials')}</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{totalMaterials}</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-muted-foreground">{t('progress.achievements')}</span>
          </div>
          <span className="text-2xl font-bold text-foreground">0</span>
        </div>
      </div>

      {/* Learning Tips */}
      <div className="mt-auto p-4 bg-secondary/50 rounded-xl border border-border">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" />
          {t('progress.tip')}
        </h4>
        <p className="text-sm text-muted-foreground">{t('progress.tipText')}</p>
      </div>
    </div>
  );
};

export default LearningProgress;
