import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLearner } from '@/contexts/LearnerContext';
import { LearnerProfile } from '@/types/learner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Sparkles, BookOpen, User, Calendar, Heart, Languages } from 'lucide-react';

const ProfileSetup: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { setProfile } = useLearner();
  
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    educationLevel: '' as LearnerProfile['educationLevel'] | '',
    learningStyle: '' as LearnerProfile['learningStyle'] | '',
    interests: '',
    bio: '',
    preferredLanguage: language as 'ar' | 'en',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthDate || !formData.educationLevel || !formData.learningStyle) {
      return;
    }

    const profile: LearnerProfile = {
      name: formData.name,
      birthDate: formData.birthDate,
      educationLevel: formData.educationLevel as LearnerProfile['educationLevel'],
      learningStyle: formData.learningStyle as LearnerProfile['learningStyle'],
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      bio: formData.bio,
      preferredLanguage: formData.preferredLanguage,
      createdAt: new Date().toISOString(),
    };

    setProfile(profile);
    setLanguage(formData.preferredLanguage);
  };

  return (
    <div className="min-h-screen gradient-warm geometric-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow mb-6">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('app.name')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('app.tagline')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-soft border border-border p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-semibold text-card-foreground">
              {t('profile.setup')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {t('profile.name')}
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
                required
              />
            </div>

            {/* Education Level */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                {t('profile.educationLevel')}
              </Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) => setFormData({ ...formData, educationLevel: value as LearnerProfile['educationLevel'] })}
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
                {t('profile.learningStyle')}
              </Label>
              <Select
                value={formData.learningStyle}
                onValueChange={(value) => setFormData({ ...formData, learningStyle: value as LearnerProfile['learningStyle'] })}
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
                placeholder={language === 'ar' ? 'الرياضيات، العلوم، التاريخ...' : 'Math, Science, History...'}
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
                onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value as 'ar' | 'en' })}
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
            >
              <Sparkles className="w-5 h-5 me-2" />
              {t('profile.save')}
            </Button>
          </form>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mt-6 gap-4">
          <Button
            variant={language === 'ar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('ar')}
          >
            العربية
          </Button>
          <Button
            variant={language === 'en' ? 'default' : 'outline'}
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
