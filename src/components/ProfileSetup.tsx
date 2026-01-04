import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { GraduationCap, Sparkles, BookOpen, Calendar, Heart, Languages, Loader2 } from 'lucide-react';

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
    learningStyle: profile?.learning_style || '',
    interests: profile?.interests?.join(', ') || '',
    bio: profile?.bio || '',
    preferredLanguage: profile?.preferred_language || currentLanguage,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        birthDate: profile.birth_date || '',
        educationLevel: profile.education_level || '',
        learningStyle: profile.learning_style || '',
        interests: profile.interests?.join(', ') || '',
        bio: profile.bio || '',
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
        'profile.learningStyle': 'أسلوب التعلم',
        'profile.interests': 'الاهتمامات',
        'profile.bio': 'نبذة مختصرة',
        'profile.language': 'اللغة المفضلة',
        'profile.save': 'حفظ الملف الشخصي',
        'education.elementary': 'ابتدائي',
        'education.middle': 'متوسط',
        'education.high': 'ثانوي',
        'education.university': 'جامعي',
        'education.professional': 'مهني',
        'style.visual': 'بصري',
        'style.practical': 'عملي',
        'style.illustrative': 'توضيحي',
        'app.name': 'درس خصوصي',
        'app.tagline': 'منصة التعلم المفتوح بالذكاء الاصطناعي',
      },
      en: {
        'profile.setup': 'Profile Setup',
        'profile.name': 'Name',
        'profile.birthDate': 'Birth Date',
        'profile.educationLevel': 'Education Level',
        'profile.learningStyle': 'Learning Style',
        'profile.interests': 'Interests',
        'profile.bio': 'Short Bio',
        'profile.language': 'Preferred Language',
        'profile.save': 'Save Profile',
        'education.elementary': 'Elementary',
        'education.middle': 'Middle School',
        'education.high': 'High School',
        'education.university': 'University',
        'education.professional': 'Professional',
        'style.visual': 'Visual',
        'style.practical': 'Practical',
        'style.illustrative': 'Illustrative',
        'app.name': 'Dars Khusoosi',
        'app.tagline': 'AI-Powered Open Learning Platform',
      },
    };
    return translations[currentLanguage][key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.educationLevel || !formData.learningStyle) {
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
      learning_style: formData.learningStyle as 'visual' | 'practical' | 'illustrative',
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      bio: formData.bio || null,
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

            {/* Learning Style */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {t('profile.learningStyle')} *
              </Label>
              <Select
                value={formData.learningStyle}
                onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">{t('style.visual')}</SelectItem>
                  <SelectItem value="practical">{t('style.practical')}</SelectItem>
                  <SelectItem value="illustrative">{t('style.illustrative')}</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Preferred Language */}
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
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
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
