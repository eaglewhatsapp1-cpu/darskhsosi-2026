import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { GraduationCap, Sparkles, BookOpen, Calendar, Heart, Languages, Loader2, Target } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: () => void;
  currentLanguage: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, currentLanguage, setLanguage }) => {
  const { profile, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    birthDate: profile?.birth_date || '',
    educationLevel: profile?.education_level || '',
    learningStyles: profile?.learning_styles || (profile?.learning_style ? [profile.learning_style] : []),
    learningLanguages: profile?.learning_languages || ['ar'],
    interests: profile?.interests?.join(', ') || '',
    bio: profile?.bio || '',
    studyTarget: profile?.study_target || '',
    preferredLanguage: profile?.preferred_language || currentLanguage,
  });

  // Only update form data on initial profile load, not on every profile change
  const hasInitialized = React.useRef(false);
  
  useEffect(() => {
    if (profile && !hasInitialized.current) {
      hasInitialized.current = true;
      setFormData({
        name: profile.name || '',
        birthDate: profile.birth_date || '',
        educationLevel: profile.education_level || '',
        learningStyles: profile.learning_styles || (profile.learning_style ? [profile.learning_style] : []),
        learningLanguages: profile.learning_languages || ['ar'],
        interests: profile.interests?.join(', ') || '',
        bio: profile.bio || '',
        studyTarget: profile.study_target || '',
        preferredLanguage: profile.preferred_language || currentLanguage,
      });
    }
  }, [profile, currentLanguage]);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        'profile.setup': 'إعداد الملف الشخصي',
        'profile.name': 'الاسم',
        'profile.birthDate': 'تاريخ الميلاد',
        'profile.educationLevel': 'المستوى التعليمي',
        'profile.learningStyle': 'أسلوب التعلم (يمكنك اختيار أكثر من واحد)',
        'profile.learningLanguages': 'لغات التعلم (يمكنك اختيار أكثر من واحد)',
        'profile.interests': 'الاهتمامات',
        'profile.bio': 'نبذة مختصرة',
        'profile.language': 'لغة واجهة التطبيق',
        'profile.studyTarget': 'هدف الدراسة (نهاية الدورة)',
        'profile.studyTargetPlaceholder': 'مثال: اجتياز امتحان الثانوية العامة بتقدير ممتاز',
        'profile.save': 'حفظ الملف الشخصي',
        'education.elementary': 'ابتدائي',
        'education.middle': 'متوسط',
        'education.high': 'ثانوي',
        'education.university': 'جامعي',
        'education.professional': 'مهني',
        'style.visual': 'بصري',
        'style.practical': 'عملي',
        'style.illustrative': 'توضيحي',
        'lang.ar': 'العربية',
        'lang.en': 'الإنجليزية',
        'app.name': 'درس خصوصي',
        'app.tagline': 'منصة التعلم المفتوح بالذكاء الاصطناعي',
      },
      en: {
        'profile.setup': 'Profile Setup',
        'profile.name': 'Name',
        'profile.birthDate': 'Birth Date',
        'profile.educationLevel': 'Education Level',
        'profile.learningStyle': 'Learning Style (Select multiple)',
        'profile.learningLanguages': 'Learning Languages (Select multiple)',
        'profile.interests': 'Interests',
        'profile.bio': 'Short Bio',
        'profile.language': 'App Interface Language',
        'profile.studyTarget': 'Study Target (End of Cycle)',
        'profile.studyTargetPlaceholder': 'Example: Pass high school exams with excellent grades',
        'profile.save': 'Save Profile',
        'education.elementary': 'Elementary',
        'education.middle': 'Middle School',
        'education.high': 'High School',
        'education.university': 'University',
        'education.professional': 'Professional',
        'style.visual': 'Visual',
        'style.practical': 'Practical',
        'style.illustrative': 'Illustrative',
        'lang.ar': 'Arabic',
        'lang.en': 'English',
        'app.name': 'Dars Khusoosi',
        'app.tagline': 'AI-Powered Open Learning Platform',
      },
    };
    return translations[currentLanguage][key] || key;
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
    
    if (!formData.name || !formData.educationLevel || formData.learningStyles.length === 0) {
      toast.error(currentLanguage === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setLoading(true);

    const preferredLang = formData.preferredLanguage === 'ar' || formData.preferredLanguage === 'en' 
      ? formData.preferredLanguage 
      : 'ar';

    const { error } = await updateProfile({
      name: formData.name,
      birth_date: formData.birthDate || null,
      education_level: formData.educationLevel as 'elementary' | 'middle' | 'high' | 'university' | 'professional',
      learning_style: formData.learningStyles[0] as 'visual' | 'practical' | 'illustrative',
      learning_styles: formData.learningStyles,
      learning_languages: formData.learningLanguages,
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      bio: formData.bio || null,
      study_target: formData.studyTarget || null,
      preferred_language: preferredLang,
    });

    setLoading(false);

    if (error) {
      toast.error(currentLanguage === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    } else {
      setLanguage(preferredLang);
      toast.success(currentLanguage === 'ar' ? 'تم حفظ الملف الشخصي!' : 'Profile saved!');
      onComplete();
    }
  };

  return (
    <div className="min-h-screen gradient-warm geometric-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow mb-6">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('app.name')}</h1>
          <p className="text-lg text-muted-foreground">{t('app.tagline')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-soft border border-border p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-semibold text-card-foreground">{t('profile.setup')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                {t('profile.name')} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12"
                required
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {t('profile.birthDate')}
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Education Level */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                {t('profile.educationLevel')} *
              </Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">{t('education.elementary')}</SelectItem>
                  <SelectItem value="middle">{t('education.middle')}</SelectItem>
                  <SelectItem value="high">{t('education.high')}</SelectItem>
                  <SelectItem value="university">{t('education.university')}</SelectItem>
                  <SelectItem value="professional">{t('education.professional')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Learning Style - Multi-select */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {t('profile.learningStyle')} *
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
                {t('profile.learningLanguages')} *
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

            {/* Study Target */}
            <div className="space-y-2">
              <Label htmlFor="studyTarget" className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {t('profile.studyTarget')}
              </Label>
              <Textarea
                id="studyTarget"
                value={formData.studyTarget}
                onChange={(e) => setFormData({ ...formData, studyTarget: e.target.value })}
                placeholder={t('profile.studyTargetPlaceholder')}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label htmlFor="interests" className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                {t('profile.interests')}
              </Label>
              <Input
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder={currentLanguage === 'ar' ? 'الرياضيات، العلوم، التاريخ...' : 'Math, Science, History...'}
                className="h-12"
              />
            </div>

            {/* Preferred App Language */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                {t('profile.language')}
              </Label>
              <Select
                value={formData.preferredLanguage}
                onValueChange={(value: string) => setFormData({ ...formData, preferredLanguage: value as 'ar' | 'en' })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">{t('lang.ar')}</SelectItem>
                  <SelectItem value="en">{t('lang.en')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">{t('profile.bio')}</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 me-2" />
                  {t('profile.save')}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mt-6 gap-4">
          <Button
            variant={currentLanguage === 'ar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('ar')}
          >
            العربية
          </Button>
          <Button
            variant={currentLanguage === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('en')}
          >
            English
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;