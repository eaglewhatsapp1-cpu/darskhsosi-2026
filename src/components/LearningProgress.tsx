import React, { useState, useEffect } from 'react';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp, Star, Target, Lightbulb, BookOpen, Award, Clock, MessageSquare, Layers, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface LearningProgressProps {
  language: 'ar' | 'en';
}

const LearningProgress: React.FC<LearningProgressProps> = ({ language }) => {
  const { materials, loading: materialsLoading } = useUploadedMaterials();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalFlashcardSets: 0,
    totalStudyPlans: 0,
    messagesToday: 0,
    streak: 1,
    weeklyActivity: [] as { day: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch message counts
        const { count: totalMessages } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Today's messages
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: messagesToday } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString());

        // Flashcard sets count
        const { count: totalFlashcardSets } = await supabase
          .from('flashcard_sets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Study plans count
        const { count: totalStudyPlans } = await supabase
          .from('study_plans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Weekly activity (last 7 days)
        const weekDays = [];
        const dayNames = language === 'ar'
          ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const nextD = new Date(d);
          nextD.setDate(nextD.getDate() + 1);

          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', d.toISOString())
            .lt('created_at', nextD.toISOString());

          weekDays.push({ day: dayNames[d.getDay()], count: count || 0 });
        }

        // Calculate streak
        let streak = 0;
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const nextD = new Date(d);
          nextD.setDate(nextD.getDate() + 1);

          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', d.toISOString())
            .lt('created_at', nextD.toISOString());

          if ((count || 0) > 0) streak++;
          else break;
        }

        setStats({
          totalMessages: totalMessages || 0,
          totalFlashcardSets: totalFlashcardSets || 0,
          totalStudyPlans: totalStudyPlans || 0,
          messagesToday: messagesToday || 0,
          streak: Math.max(streak, 0),
          weeklyActivity: weekDays,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, language]);

  if (loading || materialsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalMaterials = materials.length;
  const pieData = [
    { name: t('رسائل', 'Messages'), value: stats.totalMessages, color: 'hsl(var(--primary))' },
    { name: t('مواد', 'Materials'), value: totalMaterials, color: 'hsl(var(--accent))' },
    { name: t('بطاقات', 'Flashcards'), value: stats.totalFlashcardSets, color: '#f59e0b' },
    { name: t('خطط', 'Plans'), value: stats.totalStudyPlans, color: '#10b981' },
  ].filter(d => d.value > 0);

  const statCards = [
    { icon: MessageSquare, label: t('الرسائل', 'Messages'), value: stats.totalMessages, color: 'bg-primary/10 text-primary' },
    { icon: Star, label: t('سلسلة الأيام', 'Day Streak'), value: `${stats.streak} ${t('يوم', 'days')}`, color: 'bg-amber-500/10 text-amber-600' },
    { icon: BookOpen, label: t('المواد', 'Materials'), value: totalMaterials, color: 'bg-green-500/10 text-green-600' },
    { icon: Layers, label: t('البطاقات', 'Flashcards'), value: stats.totalFlashcardSets, color: 'bg-orange-500/10 text-orange-600' },
    { icon: Calendar, label: t('خطط دراسية', 'Study Plans'), value: stats.totalStudyPlans, color: 'bg-blue-500/10 text-blue-600' },
    { icon: Target, label: t('اليوم', 'Today'), value: stats.messagesToday, color: 'bg-purple-500/10 text-purple-600' },
  ];

  return (
    <div className="flex flex-col h-full p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar gsap-theme-animate" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          {t('لوحة التحليلات', 'Analytics Dashboard')}
        </h2>
        <p className="text-muted-foreground mt-2">{t('تتبع تقدمك في رحلة التعلم', 'Track your learning journey')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</span>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Weekly Activity */}
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-4">{t('النشاط الأسبوعي', 'Weekly Activity')}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyActivity}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution */}
        {pieData.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-foreground mb-4">{t('توزيع النشاط', 'Activity Distribution')}</h3>
            <div className="h-48 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Tip */}
      <Card className="p-4 bg-secondary/50 mt-auto">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" />
          {t('نصيحة اليوم', 'Tip of the Day')}
        </h4>
        <p className="text-sm text-muted-foreground">
          {t(
            'حاول مراجعة ما تعلمته خلال الـ 24 ساعة الماضية. المراجعة المتكررة تساعد على تثبيت المعلومات في الذاكرة طويلة المدى.',
            'Try reviewing what you learned in the last 24 hours. Repeated review helps consolidate information in long-term memory.'
          )}
        </p>
      </Card>
    </div>
  );
};

export default LearningProgress;
