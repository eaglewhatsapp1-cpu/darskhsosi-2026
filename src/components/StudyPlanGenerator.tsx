import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, Sparkles, Clock, BookOpen, Target, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Profile } from '@/hooks/useProfile';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { getSubjectTheme } from '@/utils/subjectColors';

interface StudyPlanGeneratorProps {
  language: 'ar' | 'en';
  profile?: Profile;
}

interface StudyDay {
  day: string;
  topics: string[];
  duration: string;
  activities: string[];
}

interface StudyPlan {
  title: string;
  overview: string;
  weeks: {
    weekNumber: number;
    focus: string;
    days: StudyDay[];
  }[];
  tips: string[];
}

const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({ language, profile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [duration, setDuration] = useState('2');
  const { materials } = useUploadedMaterials();
  
  const subjectTheme = getSubjectTheme(profile?.subject || 'general');
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const generatePlan = async () => {
    if (materials.length === 0) {
      toast.error(t(
        'الرجاء رفع مواد تعليمية أولاً لإنشاء خطة دراسية',
        'Please upload study materials first to generate a study plan'
      ));
      return;
    }

    setIsLoading(true);
    setPlan(null);

    try {
      const materialsSummary = materials.map(m => ({
        name: m.file_name,
        content: m.content?.substring(0, 2000) || 'No content extracted'
      }));

      const { data, error } = await supabase.functions.invoke('generate-study-plan', {
        body: {
          materials: materialsSummary,
          subject: profile?.subject || 'general',
          educationLevel: profile?.education_level || 'high',
          learningStyle: profile?.learning_style || 'visual',
          durationWeeks: parseInt(duration),
          language
        }
      });

      if (error) throw error;

      if (data?.plan) {
        setPlan(data.plan);
        toast.success(t('تم إنشاء الخطة الدراسية بنجاح!', 'Study plan generated successfully!'));
      }
    } catch (error: any) {
      console.error('Error generating plan:', error);
      toast.error(t('حدث خطأ في إنشاء الخطة', 'Error generating the plan'));
    } finally {
      setIsLoading(false);
    }
  };

  const dayNames = language === 'ar' 
    ? ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    : ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" style={{ color: subjectTheme.primary }} />
            {t('توليد خطة دراسية مخصصة', 'Generate Personalized Study Plan')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t(
              'أنشئ جدولاً دراسياً مخصصاً بناءً على موادك التعليمية ومستواك',
              'Create a custom study schedule based on your materials and level'
            )}
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4 pt-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                {t('مدة الخطة', 'Plan Duration')}
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('أسبوع واحد', '1 Week')}</SelectItem>
                  <SelectItem value="2">{t('أسبوعين', '2 Weeks')}</SelectItem>
                  <SelectItem value="4">{t('شهر', '1 Month')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={generatePlan} 
              disabled={isLoading}
              style={{ background: subjectTheme.gradient }}
              className="text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin me-2" />
              ) : (
                <Sparkles className="w-4 h-4 me-2" />
              )}
              {t('إنشاء الخطة', 'Generate Plan')}
            </Button>
          </div>

          {/* Materials Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <BookOpen className="w-4 h-4" />
            <span>
              {t(`${materials.length} مواد تعليمية متاحة`, `${materials.length} materials available`)}
            </span>
          </div>

          {/* Generated Plan */}
          {plan && (
            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-4 space-y-6">
                {/* Plan Header */}
                <div 
                  className="p-4 rounded-lg text-white"
                  style={{ background: subjectTheme.gradient }}
                >
                  <h2 className="text-xl font-bold mb-2">{plan.title}</h2>
                  <p className="text-white/90">{plan.overview}</p>
                </div>

                {/* Weeks */}
                {plan.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5" style={{ color: subjectTheme.primary }} />
                      {t(`الأسبوع ${week.weekNumber}`, `Week ${week.weekNumber}`)} - {week.focus}
                    </h3>
                    
                    <div className="grid gap-2">
                      {week.days.map((day, dayIndex) => (
                        <Card key={dayIndex} className="border-s-4" style={{ borderColor: subjectTheme.primary }}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{day.day}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {day.duration}
                              </span>
                            </div>
                            <ul className="text-sm space-y-1">
                              {day.topics.map((topic, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span style={{ color: subjectTheme.primary }}>•</span>
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tips */}
                {plan.tips && plan.tips.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{t('نصائح للنجاح', 'Tips for Success')}</h3>
                    <ul className="space-y-1 text-sm">
                      {plan.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 mt-0.5" style={{ color: subjectTheme.primary }} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Empty State */}
          {!plan && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Calendar className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-center mb-2">
                {t(
                  'اضغط على "إنشاء الخطة" للحصول على جدول دراسي مخصص',
                  'Click "Generate Plan" to get a personalized study schedule'
                )}
              </p>
              <p className="text-xs text-center">
                {t(
                  'تأكد من رفع مواد تعليمية أولاً',
                  'Make sure to upload study materials first'
                )}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: subjectTheme.primary }} />
              <p className="text-muted-foreground">
                {t('جاري إنشاء خطتك الدراسية...', 'Generating your study plan...')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyPlanGenerator;
