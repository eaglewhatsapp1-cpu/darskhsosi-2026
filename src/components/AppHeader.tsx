import React from 'react';
import { Profile } from '@/hooks/useProfile';
import { getSubjectTheme, getAllSubjects, Subject } from '@/utils/subjectColors';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Sparkles, Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
interface AppHeaderProps {
  profile: Profile;
  language: 'ar' | 'en';
  onSubjectChange: (subject: Subject) => void;
}
const AppHeader: React.FC<AppHeaderProps> = ({
  profile,
  language,
  onSubjectChange
}) => {
  const {
    theme,
    setTheme
  } = useTheme();
  const {
    updateProfile
  } = useProfile();
  const subjectTheme = getSubjectTheme(profile.subject || 'general');
  const subjects = getAllSubjects();
  const t = (ar: string, en: string) => language === 'ar' ? ar : en;
  const toggleLanguage = async () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    await updateProfile({
      preferred_language: newLang
    });
  };
  const getEducationLevelText = () => {
    const levels: Record<string, {
      ar: string;
      en: string;
    }> = {
      elementary: {
        ar: 'ابتدائي',
        en: 'Elementary'
      },
      middle: {
        ar: 'متوسط',
        en: 'Middle School'
      },
      high: {
        ar: 'ثانوي',
        en: 'High School'
      },
      university: {
        ar: 'جامعي',
        en: 'University'
      },
      professional: {
        ar: 'متخصص',
        en: 'Professional'
      }
    };
    return levels[profile.education_level || 'high']?.[language] || '';
  };
  return <header className="w-full border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-4 border-amber-50 py-[8px]" style={{
    borderColor: subjectTheme.primary,
    borderBottomWidth: '3px'
  }}>
      <div className="flex items-center justify-between gap-4 my-[14px] mx-[14px] px-[22px] py-0 bg-[#242424] text-[#fcfbf8]">
        {/* Logo & Platform Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{
          background: subjectTheme.gradient
        }}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              {t('درس خصوصي', 'Private Tutor')}
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h1>
            <span className="text-xs text-muted-foreground mx-0 my-[6px]">
              {t('مساعدك التعليمي الذكي', 'Your Smart Learning Assistant')}
            </span>
          </div>
        </div>

        {/* Subject Selector */}
        <div className="flex-1 max-w-xs">
          <Select value={profile.subject || 'general'} onValueChange={value => onSubjectChange(value as Subject)}>
            <SelectTrigger className="w-full border-2 font-medium" style={{
            borderColor: subjectTheme.primary,
            backgroundColor: subjectTheme.secondary
          }}>
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{subjectTheme.icon}</span>
                  <span>{language === 'ar' ? subjectTheme.nameAr : subjectTheme.nameEn}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => <SelectItem key={subject.id} value={subject.id}>
                  <span className="flex items-center gap-2">
                    <span>{subject.icon}</span>
                    <span>{language === 'ar' ? subject.nameAr : subject.nameEn}</span>
                  </span>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Actions & Student Info */}
        <div className="flex items-center gap-3 px-[74px]">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-full flex items-center gap-1 px-2 w-auto">
            <Languages className="w-5 h-5" />
            <span className="text-xs font-bold">{language === 'ar' ? 'EN' : 'AR'}</span>
          </Button>

          <div className="text-end hidden sm:block">
            <p className="font-semibold text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <span className="inline-block w-2 h-2 rounded-full" style={{
              backgroundColor: subjectTheme.primary
            }} />
              {getEducationLevelText()}
            </p>
          </div>
          <Avatar className="w-10 h-10 border-2" style={{
          borderColor: subjectTheme.primary
        }}>
            <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
            <AvatarFallback className="text-white font-bold" style={{
            background: subjectTheme.gradient
          }}>
              {profile.name?.charAt(0)?.toUpperCase() || 'م'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>;
};
export default AppHeader;