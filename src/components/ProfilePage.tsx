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
import { Separator } from '@/components/ui/separator';
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
  LogOut
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
  
  const [formData, setFormData] = useState({
    name: profile.name || '',
    birthDate: profile.birth_date || '',
    bio: profile.bio || '',
    educationLevel: profile.education_level || '',
    learningStyle: profile.learning_style || '',
    interests: profile.interests?.join(', ') || '',
    preferredLanguage: profile.preferred_language || 'ar',
    aiPersona: profile.ai_persona || 'teacher',
    speakingStyle: profile.speaking_style || 'formal_ar',
    knowledgeRatio: profile.knowledge_ratio ?? 50,
  });

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'page.title': { ar: 'الملف الشخصي', en: 'Profile' },
      'section.personal': { ar: 'المعلومات الشخصية', en: 'Personal Information' },
      'section.learning': { ar: 'إعدادات التعلم', en: 'Learning Settings' },
      'section.ai': { ar: 'إعدادات الذكاء الاصطناعي', en: 'AI Settings' },
      'section.account': { ar: 'إعدادات الحساب', en: 'Account Settings' },
      'field.name': { ar: 'الاسم الكامل', en: 'Full Name' },
      'field.birthDate': { ar: 'تاريخ الميلاد', en: 'Birth Date' },
      'field.bio': { ar: 'نبذة مختصرة', en: 'Short Bio' },
      'field.avatar': { ar: 'الصورة الشخصية', en: 'Profile Photo' },
      'field.education': { ar: 'المستوى التعليمي', en: 'Education Level' },
      'field.style': { ar: 'أسلوب التعلم', en: 'Learning Style' },
      'field.interests': { ar: 'الاهتمامات', en: 'Interests' },
      'field.language': { ar: 'اللغة المفضلة', en: 'Preferred Language' },
      'field.persona': { ar: 'شخصية المعلم', en: 'AI Persona' },
      'field.speaking': { ar: 'أسلوب التحدث', en: 'Speaking Style' },
      'field.knowledge': { ar: 'حدود المعرفة', en: 'Knowledge Boundary' },
      'knowledge.materials': { ar: '📚 موادي فقط', en: '📚 My Materials Only' },
      'knowledge.internet': { ar: '🌐 الإنترنت كاملاً', en: '🌐 Full Internet' },
      'knowledge.desc': { ar: 'تحكم في مصادر معرفة المعلم الذكي', en: 'Control the AI teacher\'s knowledge sources' },
      'education.elementary': { ar: 'ابتدائي', en: 'Elementary' },
      'education.middle': { ar: 'متوسط', en: 'Middle School' },
      'education.high': { ar: 'ثانوي', en: 'High School' },
      'education.university': { ar: 'جامعي', en: 'University' },
      'education.professional': { ar: 'مهني', en: 'Professional' },
      'style.visual': { ar: 'بصري - أتعلم بالصور والرسوم', en: 'Visual - I learn with images' },
      'style.practical': { ar: 'عملي - أتعلم بالتطبيق', en: 'Practical - I learn by doing' },
      'style.illustrative': { ar: 'توضيحي - أتعلم بالشرح المفصل', en: 'Illustrative - I learn by explanation' },
      'persona.teacher': { ar: 'معلم - صبور ومشجع', en: 'Teacher - Patient and encouraging' },
      'persona.scientist': { ar: 'عالم - دقيق ومنهجي', en: 'Scientist - Precise and methodical' },
      'persona.examiner': { ar: 'ممتحن - يختبر فهمك', en: 'Examiner - Tests your understanding' },
      'persona.analyzer': { ar: 'محلل - يحلل ويفسر', en: 'Analyzer - Analyzes and explains' },
      'speaking.formal_ar': { ar: 'عربي فصيح', en: 'Formal Arabic' },
      'speaking.colloquial_ar': { ar: 'عربي عامي', en: 'Colloquial Arabic' },
      'speaking.en': { ar: 'إنجليزي', en: 'English' },
      'speaking.mixed': { ar: 'مختلط (عربي وإنجليزي)', en: 'Mixed (Arabic & English)' },
      'action.save': { ar: 'حفظ التغييرات', en: 'Save Changes' },
      'action.signout': { ar: 'تسجيل الخروج', en: 'Sign Out' },
      'action.upload': { ar: 'تغيير الصورة', en: 'Change Photo' },
      'success.save': { ar: 'تم حفظ الملف الشخصي!', en: 'Profile saved!' },
      'error.save': { ar: 'حدث خطأ. حاول مرة أخرى.', en: 'An error occurred. Please try again.' },
    };
    return translations[key]?.[language] || key;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${profile.user_id}/${Date.now()}_avatar.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      toast.success(language === 'ar' ? 'تم تحديث الصورة!' : 'Photo updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const preferredLang = formData.preferredLanguage === 'ar' || formData.preferredLanguage === 'en' 
      ? formData.preferredLanguage 
      : 'ar';
    const aiPersona = ['teacher', 'scientist', 'examiner', 'analyzer'].includes(formData.aiPersona) 
      ? formData.aiPersona as Profile['ai_persona']
      : 'teacher';
    const speakingStyle = ['formal_ar', 'colloquial_ar', 'en', 'mixed'].includes(formData.speakingStyle)
      ? formData.speakingStyle as Profile['speaking_style']
      : 'formal_ar';

    const { error } = await updateProfile({
      name: formData.name,
      birth_date: formData.birthDate || null,
      bio: formData.bio || null,
      education_level: formData.educationLevel as Profile['education_level'],
      learning_style: formData.learningStyle as Profile['learning_style'],
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      preferred_language: preferredLang,
      ai_persona: aiPersona,
      speaking_style: speakingStyle,
      knowledge_ratio: formData.knowledgeRatio,
    });

    setLoading(false);

    if (error) {
      toast.error(t('error.save'));
    } else {
      toast.success(t('success.save'));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
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
          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('section.personal')}
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="text-2xl gradient-primary text-white">
                    {profile.name?.charAt(0)?.toUpperCase() || 'م'}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -end-2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('field.avatar')}</p>
                <p className="text-sm text-muted-foreground">{t('action.upload')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('field.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {t('field.birthDate')}
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="bio">{t('field.bio')}</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>
          </Card>

          {/* Learning Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {t('section.learning')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {t('field.education')}
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

              <div className="space-y-2">
                <Label>{t('field.style')}</Label>
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
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="interests" className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                {t('field.interests')}
              </Label>
              <Input
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder={language === 'ar' ? 'الرياضيات، العلوم، التاريخ...' : 'Math, Science, History...'}
                className="h-12"
              />
            </div>

            <div className="mt-4 space-y-2">
              <Label className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                {t('field.language')}
              </Label>
              <Select
                value={formData.preferredLanguage}
                onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value as 'ar' | 'en' })}
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
          </Card>

          {/* AI Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              {t('section.ai')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('field.persona')}</Label>
              <Select
                  value={formData.aiPersona}
                  onValueChange={(value) => setFormData({ ...formData, aiPersona: value as 'teacher' | 'scientist' | 'examiner' | 'analyzer' })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">{t('persona.teacher')}</SelectItem>
                    <SelectItem value="scientist">{t('persona.scientist')}</SelectItem>
                    <SelectItem value="examiner">{t('persona.examiner')}</SelectItem>
                    <SelectItem value="analyzer">{t('persona.analyzer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  {t('field.speaking')}
                </Label>
                <Select
                  value={formData.speakingStyle}
                  onValueChange={(value) => setFormData({ ...formData, speakingStyle: value as 'formal_ar' | 'colloquial_ar' | 'en' | 'mixed' })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal_ar">{t('speaking.formal_ar')}</SelectItem>
                    <SelectItem value="colloquial_ar">{t('speaking.colloquial_ar')}</SelectItem>
                    <SelectItem value="en">{t('speaking.en')}</SelectItem>
                    <SelectItem value="mixed">{t('speaking.mixed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Knowledge Ratio Slider */}
            <div className="mt-6 space-y-4">
              <Label className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                {t('field.knowledge')}
              </Label>
              <p className="text-sm text-muted-foreground">{t('knowledge.desc')}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t('knowledge.materials')}</span>
                  <span className="font-medium">{t('knowledge.internet')}</span>
                </div>
                <Slider
                  value={[formData.knowledgeRatio]}
                  onValueChange={(value) => setFormData({ ...formData, knowledgeRatio: value[0] })}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {formData.knowledgeRatio}% {language === 'ar' ? 'من الإنترنت' : 'from Internet'}
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              className="flex-1 h-12 gradient-primary"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin me-2" />
              ) : (
                <Save className="w-5 h-5 me-2" />
              )}
              {t('action.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12"
              onClick={signOut}
            >
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
