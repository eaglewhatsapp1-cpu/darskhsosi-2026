import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLearner } from '@/contexts/LearnerContext';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Star,
  Target,
  Lightbulb,
  BookOpen,
  Award,
  Clock,
} from 'lucide-react';

const LearningProgress: React.FC = () => {
  const { t, dir } = useLanguage();
  const { profile, uploadedMaterials } = useLearner();

  const mockProgress = {
    totalHours: 12,
    completedTopics: 8,
    totalTopics: 15,
    streak: 5,
    strengths: ['الرياضيات', 'الفيزياء'],
    areasToImprove: ['الكيمياء'],
  };

  const progressPercentage = (mockProgress.completedTopics / mockProgress.totalTopics) * 100;

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          {t('sidebar.progress')}
        </h2>
        <p className="text-muted-foreground mt-2">
          تتبع تقدمك في رحلة التعلم
        </p>
      </div>

      {/* Main Progress Card */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-foreground">التقدم العام</span>
          <span className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3 mb-4" />
        <p className="text-sm text-muted-foreground">
          أكملت {mockProgress.completedTopics} من {mockProgress.totalTopics} موضوعاً
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">ساعات التعلم</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{mockProgress.totalHours}</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">سلسلة الأيام</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{mockProgress.streak} أيام</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">المواد المرفوعة</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{uploadedMaterials.length}</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-muted-foreground">الإنجازات</span>
          </div>
          <span className="text-2xl font-bold text-foreground">3</span>
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">نقاط القوة</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {mockProgress.strengths.map((strength, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {strength}
            </span>
          ))}
        </div>
      </div>

      {/* Areas to Improve */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">مجالات للتحسين</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {mockProgress.areasToImprove.map((area, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Learning Tips */}
      <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-border">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" />
          نصيحة اليوم
        </h4>
        <p className="text-sm text-muted-foreground">
          حاول مراجعة ما تعلمته خلال الـ 24 ساعة الماضية. المراجعة المتكررة تساعد على تثبيت المعلومات في الذاكرة طويلة المدى.
        </p>
      </div>
    </div>
  );
};

export default LearningProgress;
