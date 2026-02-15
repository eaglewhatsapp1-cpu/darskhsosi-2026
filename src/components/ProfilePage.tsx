import React, { useState, useRef } from 'react';
import { Profile, useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  User,
  Camera,
  GraduationCap,
  BookOpen,
  Languages,
  Bot,
  MessageSquare,
  Sliders,
  Save,
  Loader2,
  Calendar,
  Heart,
  LogOut,
  Target,
  Zap,
  ShieldAlert
} from 'lucide-react';

interface ProfilePageProps {
  profile: Profile;
  language: 'ar' | 'en';
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, language }) => {
  const { updateProfile } = useProfile();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Initialize form data from profile using lazy initializer to prevent loops
  const [formData, setFormData] = useState(() => {
    if (profile && !hasInitialized.current) {
      hasInitialized.current = true;
      return {
        name: profile.name || '',
        birthDate: profile.birth_date || '',
        bio: profile.bio || '',
        hobbies: profile.hobbies || '',
        goals: profile.goals || '',
        strengths: profile.strengths || '',
        weaknesses: profile.weaknesses || '',
        studyTarget: profile.study_target || '',
        educationLevel: profile.education_level || '',
        learningStyles: profile.learning_styles || (profile.learning_style ? [profile.learning_style] : []),
        learningLanguages: profile.learning_languages || ['ar'],
        interests: profile.interests?.join(', ') || '',
        preferredLanguage: (profile.preferred_language as 'ar' | 'en' | 'both') || 'ar',
        aiPersona: profile.ai_persona || 'teacher',
        speakingStyle: profile.speaking_style || 'formal_ar',
        knowledgeRatio: profile.knowledge_ratio ?? 50,
        openaiApiKey: profile.openai_api_key || '',
        geminiApiKey: profile.gemini_api_key || '',
      };
    }
    return {
      name: '',
      birthDate: '',
      bio: '',
      hobbies: '',
      goals: '',
      strengths: '',
      weaknesses: '',
      studyTarget: '',
      educationLevel: '',
      learningStyles: [] as string[],
      learningLanguages: ['ar'] as string[],
      interests: '',
      preferredLanguage: 'ar' as 'ar' | 'en' | 'both',
      aiPersona: 'teacher' as string,
      speakingStyle: 'formal_ar' as string,
      knowledgeRatio: 50,
      openaiApiKey: '',
      geminiApiKey: '',
    };
  });

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'page.title': { ar: 'الملف الشخصي', en: 'Profile' },
      'section.personal': { ar: 'المعلومات الشخصية', en: 'Personal Information' },
      'section.learning': { ar: 'إعدادات التعلم', en: 'Learning Settings' },
      'section.ai': { ar: 'إعدادات الذكاء الاصطناعي', en: 'AI Settings' },
      'section.backup_keys': { ar: 'مفاتيح API البديلة (اختياري)', en: 'Backup API Keys (Optional)' },
      'usage.guide_title': { ar: 'دليل استخدام المفاتيح الشخصية', en: 'Personal API usage guide' },
      'usage.guide_desc': { ar: 'هذا التطبيق مجاني ويستخدم مفتاحاً مشتركاً. إذا واجهت رسالة "تجاوز الحد المسموح"، يمكنك إضافة مفاتيحك الخاصة هنا لضمان استمرارية الخدمة لك حصرياً.', en: 'This app is free and uses a shared key. If you see "Usage limit exceeded", you can add your own keys here to ensure uninterrupted service just for you.' },
      'field.openai_key': { ar: 'OpenAI API Key (نسخة 4-o أو 3.5)', en: 'OpenAI API Key (4-o or 3.5)' },
      'field.gemini_key': { ar: 'Google Gemini API Key', en: 'Google Gemini API Key' },
      'field.name': { ar: 'الاسم الكامل', en: 'Full Name' },
      'field.birthDate': { ar: 'تاريخ الميلاد', en: 'Birth Date' },
      'field.bio': { ar: 'نبذة مختصرة', en: 'Short Bio' },
      'field.hobbies': { ar: 'الهوايات', en: 'Hobbies' },
      'field.goals': { ar: 'الأهداف التعليمية', en: 'Learning Goals' },
      'field.strengths': { ar: 'نقاط القوة', en: 'Strengths' },
      'field.weaknesses': { ar: 'نقاط الضعف', en: 'Weaknesses' },
      'field.studyTarget': { ar: 'هدف الدراسة (نهاية الدورة)', en: 'Study Target (End of Cycle)' },
      'field.studyTargetPlaceholder': { ar: 'مثال: اجتياز امتحان الثانوية العامة بتقدير ممتاز', en: 'Example: Pass high school exams with excellent grades' },
      'field.avatar': { ar: 'الصورة الشخصية', en: 'Profile Photo' },
      'field.education': { ar: 'المستوى التعليمي', en: 'Education Level' },
      'field.style': { ar: 'أسلوب التعلم (يمكنك اختيار أكثر من واحد)', en: 'Learning Style (Select multiple)' },
      'field.learningLanguages': { ar: 'لغات التعلم (يمكنك اختيار أكثر من واحد)', en: 'Learning Languages (Select multiple)' },
      'field.interests': { ar: 'الاهتمامات', en: 'Interests' },
      'field.language': { ar: 'لغة واجهة التطبيق', en: 'App Interface Language' },
      'field.persona': { ar: 'شخصية المعلم', en: 'AI Persona' },
      'field.speaking': { ar: 'أسلوب التحدث', en: 'Speaking Style' },
      'field.knowledge': { ar: 'حدود المعرفة', en: 'Knowledge Boundary' },
      'knowledge.materials': { ar: '📚 موادي فقط', en: '📚 My Materials Only' },
      'knowledge.internet': { ar: '🌐 الإنترنت كاملاً', en: '🌐 Full Internet' },
      'education.elementary': { ar: 'ابتدائي', en: 'Elementary' },
      'education.middle': { ar: 'متوسط', en: 'Middle School' },
      'education.high': { ar: 'ثانوي', en: 'High School' },
      'education.university': { ar: 'جامعي', en: 'University' },
      'education.professional': { ar: 'مهني', en: 'Professional' },
      'style.visual': { ar: 'بصري', en: 'Visual' },
      'style.practical': { ar: 'عملي', en: 'Practical' },
      'style.illustrative': { ar: 'توضيحي', en: 'Illustrative' },
      'lang.ar': { ar: 'العربية', en: 'Arabic' },
      'lang.en': { ar: 'الإنجليزية', en: 'English' },
      'lang.both': { ar: 'عربي وإنجليزي معاً', en: 'Arabic & English' },
      'action.save': { ar: 'حفظ التغييرات', en: 'Save Changes' },
      'action.signout': { ar: 'تسجيل الخروج', en: 'Sign Out' },
      'success.save': { ar: 'تم حفظ الملف الشخصي!', en: 'Profile saved!' },
      'error.save': { ar: 'حدث خطأ. حاول مرة أخرى.', en: 'An error occurred. Please try again.' },
    };
    return translations[key]?.[language] || key;
  };

  const handleLearningStyleToggle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      learningStyles: prev.learningStyles.includes(style)
        ? prev.learningStyles.filter(s => s !== style)
        : [...prev.learningStyles, style]
    }));
  };

  const handleLearningLanguageToggle = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      learningLanguages: prev.learningLanguages.includes(lang)
        ? prev.learningLanguages.filter(l => l !== lang)
        : [...prev.learningLanguages, lang]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateProfile({
      name: formData.name,
      birth_date: formData.birthDate || null,
      bio: formData.bio || null,
      hobbies: formData.hobbies || null,
      goals: formData.goals || null,
      strengths: formData.strengths || null,
      weaknesses: formData.weaknesses || null,
      study_target: formData.studyTarget || null,
      education_level: formData.educationLevel as Profile['education_level'],
      learning_styles: formData.learningStyles,
      learning_languages: formData.learningLanguages,
      learning_style: formData.learningStyles[0] as Profile['learning_style'],
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      preferred_language: formData.preferredLanguage as Profile['preferred_language'],
      ai_persona: formData.aiPersona as Profile['ai_persona'],
      speaking_style: formData.speakingStyle as Profile['speaking_style'],
      knowledge_ratio: formData.knowledgeRatio,
      openai_api_key: formData.openaiApiKey || null,
      gemini_api_key: formData.geminiApiKey || null,
    });

    setLoading(false);
    if (error) toast.error(t('error.save'));
    else toast.success(t('success.save'));
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 md:p-6 custom-scrollbar gsap-theme-animate">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('page.title')}</h1>
            <p className="text-muted-foreground">{profile.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('section.personal')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('field.name')}</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />{t('field.birthDate')}</Label>
                <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="h-12" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="bio">{t('field.bio')}</Label>
              <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="min-h-[80px] resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="hobbies" className="flex items-center gap-2"><Heart className="w-4 h-4 text-primary" />{t('field.hobbies')}</Label>
                <Input id="hobbies" value={formData.hobbies} onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals" className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" />{t('field.goals')}</Label>
                <Input id="goals" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} className="h-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="strengths" className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" />{t('field.strengths')}</Label>
                <Input id="strengths" value={formData.strengths} onChange={(e) => setFormData({ ...formData, strengths: e.target.value })} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weaknesses" className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-primary" />{t('field.weaknesses')}</Label>
                <Input id="weaknesses" value={formData.weaknesses} onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })} className="h-12" />
              </div>
            </div>

            {/* Study Target */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="studyTarget" className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {t('field.studyTarget')}
              </Label>
              <Textarea
                id="studyTarget"
                value={formData.studyTarget}
                onChange={(e) => setFormData({ ...formData, studyTarget: e.target.value })}
                placeholder={t('field.studyTargetPlaceholder')}
                className="min-h-[80px] resize-none"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {t('section.learning')}
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" />{t('field.education')}</Label>
                <Select value={formData.educationLevel} onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">{t('education.elementary')}</SelectItem>
                    <SelectItem value="middle">{t('education.middle')}</SelectItem>
                    <SelectItem value="high">{t('education.high')}</SelectItem>
                    <SelectItem value="university">{t('education.university')}</SelectItem>
                    <SelectItem value="professional">{t('education.professional')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Learning Styles - Multi-select */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {t('field.style')}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['visual', 'practical', 'illustrative'].map((style) => (
                    <div
                      key={style}
                      className="flex items-center space-x-2 rtl:space-x-reverse border border-border bg-background p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleLearningStyleToggle(style)}
                    >
                      <Checkbox
                        checked={formData.learningStyles.includes(style)}
                        onCheckedChange={() => handleLearningStyleToggle(style)}
                      />
                      <Label className="cursor-pointer flex-1">{t(`style.${style}`)}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Languages - Multi-select */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" />
                  {t('field.learningLanguages')}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: 'ar', label: t('lang.ar') },
                    { value: 'en', label: t('lang.en') },
                  ].map((lang) => (
                    <div
                      key={lang.value}
                      className="flex items-center space-x-2 rtl:space-x-reverse border border-border bg-background p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleLearningLanguageToggle(lang.value)}
                    >
                      <Checkbox
                        checked={formData.learningLanguages.includes(lang.value)}
                        onCheckedChange={() => handleLearningLanguageToggle(lang.value)}
                      />
                      <Label className="cursor-pointer flex-1">{lang.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* App Interface Language */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Languages className="w-4 h-4 text-primary" />{t('field.language')}</Label>
                <Select value={formData.preferredLanguage} onValueChange={(value: 'ar' | 'en' | 'both') => setFormData({ ...formData, preferredLanguage: value })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">{t('lang.ar')}</SelectItem>
                    <SelectItem value="en">{t('lang.en')}</SelectItem>
                    <SelectItem value="both">{t('lang.both')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              {t('section.ai')}
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>{t('field.persona')}</Label>
                <Select value={formData.aiPersona} onValueChange={(value) => setFormData({ ...formData, aiPersona: value })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">{language === 'ar' ? '👨‍🏫 معلم صبور' : '👨‍🏫 Patient Teacher'}</SelectItem>
                    <SelectItem value="scientist">{language === 'ar' ? '🧪 عالم عبقري' : '🧪 Genius Scientist'}</SelectItem>
                    <SelectItem value="examiner">{language === 'ar' ? '📝 ممتحن دقيق' : '📝 Strict Examiner'}</SelectItem>
                    <SelectItem value="analyzer">{language === 'ar' ? '🔍 محلل ذكي' : '🔍 Smart Analyzer'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('field.speaking')}</Label>
                <Select value={formData.speakingStyle} onValueChange={(value) => setFormData({ ...formData, speakingStyle: value })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal_ar">{language === 'ar' ? 'لغة عربية فصحى' : 'Formal Arabic'}</SelectItem>
                    <SelectItem value="egyptian">{language === 'ar' ? 'عامية مصرية' : 'Egyptian Slang'}</SelectItem>
                    <SelectItem value="friendly_en">{language === 'ar' ? 'إنجليزية ودودة' : 'Friendly English'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>{t('field.knowledge')}</Label>
                  <span className="text-xs font-bold text-primary">
                    {formData.knowledgeRatio === 0 ? t('knowledge.materials') :
                      formData.knowledgeRatio === 100 ? t('knowledge.internet') :
                        `${formData.knowledgeRatio}%`}
                  </span>
                </div>
                <Slider
                  value={[formData.knowledgeRatio]}
                  onValueChange={(val) => setFormData({ ...formData, knowledgeRatio: val[0] })}
                  max={100}
                  step={10}
                  className="py-4"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{t('knowledge.materials')}</span>
                  <span>{t('knowledge.internet')}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-amber-200 bg-amber-50/30">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              {t('section.backup_keys')}
            </h2>

            <div className="bg-white/50 p-4 rounded-xl border border-amber-100 mb-6">
              <h3 className="text-sm font-bold text-amber-700 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {t('usage.guide_title')}
              </h3>
              <p className="text-xs text-amber-600 leading-relaxed">
                {t('usage.guide_desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">{t('field.openai_key')}</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  placeholder="sk-..."
                  value={formData.openaiApiKey}
                  onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                  className="h-12 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="geminiApiKey">{t('field.gemini_key')}</Label>
                <Input
                  id="geminiApiKey"
                  type="password"
                  placeholder="AIza..."
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  className="h-12 bg-white"
                />
              </div>
            </div>

            <p className="mt-4 text-[10px] text-muted-foreground italic">
              * {language === 'ar' ? 'يتم تشفير المفاتيح وحفظها في قاعدة بيانات آمنة خاصة بك.' : 'Keys are encrypted and saved in your private secure database.'}
            </p>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" className="flex-1 h-12 gradient-primary" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin me-2" /> : <Save className="w-5 h-5 me-2" />}
              {t('action.save')}
            </Button>
            <Button type="button" variant="outline" className="h-12" onClick={signOut}>
              <LogOut className="w-5 h-5 me-2" />
              {t('action.signout')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;