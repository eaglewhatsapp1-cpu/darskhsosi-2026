import React from 'react';
import { Profile } from '@/hooks/useProfile';
import { SidebarFeature } from './LearningPlatform';
import { cn } from '@/lib/utils';
import { GraduationCap, Upload, Network, Lightbulb, FileText, Users, Video, ClipboardCheck, TrendingUp, ChevronLeft, ChevronRight, LogOut, Link, Calendar, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeFeature: SidebarFeature;
  setActiveFeature: (feature: SidebarFeature) => void;
  profile: Profile;
  language: 'ar' | 'en';
  onSignOut: () => void;
}
const features: {
  id: SidebarFeature;
  icon: React.ElementType;
}[] = [{
  id: 'teacher',
  icon: GraduationCap
}, {
  id: 'upload',
  icon: Upload
}, {
  id: 'mindmap',
  icon: Network
}, {
  id: 'simplify',
  icon: Lightbulb
}, {
  id: 'summary',
  icon: FileText
}, {
  id: 'scientist',
  icon: Users
}, {
  id: 'video',
  icon: Video
}, {
  id: 'test',
  icon: ClipboardCheck
}, {
  id: 'progress',
  icon: TrendingUp
}, {
  id: 'weblink',
  icon: Link
}, {
  id: 'studyplan',
  icon: Calendar
}, {
  id: 'projects',
  icon: Rocket
}];
const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onToggle,
  activeFeature,
  setActiveFeature,
  profile,
  language,
  onSignOut
}) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        'app.name': 'درس خصوصي',
        'sidebar.teacher': 'المعلم الذكي',
        'sidebar.upload': 'رفع المواد',
        'sidebar.mindmap': 'الخريطة الذهنية',
        'sidebar.simplify': 'تبسيط المفاهيم',
        'sidebar.summary': 'الملخص',
        'sidebar.scientist': 'حديث مع عالم',
        'sidebar.video': 'التعلم بالفيديو',
        'sidebar.test': 'اختبار الفهم',
        'sidebar.progress': 'تقدم التعلم',
        'sidebar.weblink': 'شرح الروابط',
        'sidebar.studyplan': 'خطة دراسية',
        'sidebar.projects': 'مشاريع عملية',
        'action.signout': 'تسجيل الخروج'
      },
      en: {
        'app.name': 'Dars Khusoosi',
        'sidebar.teacher': 'Intelligent Teacher',
        'sidebar.upload': 'Upload Materials',
        'sidebar.mindmap': 'Mind Map',
        'sidebar.simplify': 'Simplify Concept',
        'sidebar.summary': 'Summary',
        'sidebar.scientist': 'Talk to Scientist',
        'sidebar.video': 'Learn with Video',
        'sidebar.test': 'Understanding Test',
        'sidebar.progress': 'Learning Progress',
        'sidebar.weblink': 'Explain Links',
        'sidebar.studyplan': 'Study Plan',
        'sidebar.projects': 'Projects',
        'action.signout': 'Sign Out'
      }
    };
    return translations[language][key] || key;
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const educationLabels: Record<string, Record<string, string>> = {
    ar: {
      elementary: 'ابتدائي',
      middle: 'متوسط',
      high: 'ثانوي',
      university: 'جامعي',
      professional: 'مهني'
    },
    en: {
      elementary: 'Elementary',
      middle: 'Middle School',
      high: 'High School',
      university: 'University',
      professional: 'Professional'
    }
  };
  return <aside className={cn('h-screen bg-sidebar flex flex-col transition-all duration-300 border-e border-sidebar-border', collapsed ? 'w-16' : 'w-64')}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-accent">
              <GraduationCap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-lg leading-tight">
                {t('app.name')}
              </h1>
            </div>
          </div>}
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0">
          {dir === 'rtl' ? collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" /> : collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-0 my-[82px]">
        <ul className="space-y-1 px-2">
          {features.map(feature => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          const button = <button onClick={() => setActiveFeature(feature.id)} className={cn("w-full items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 flex flex-row", isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-accent' : 'text-sidebar-foreground hover:bg-sidebar-accent')}>
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium truncate">
                    {t(`sidebar.${feature.id}`)}
                  </span>}
              </button>;
          return <li key={feature.id}>
                {collapsed ? <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side={dir === 'rtl' ? 'left' : 'right'}>
                      {t(`sidebar.${feature.id}`)}
                    </TooltipContent>
                  </Tooltip> : button}
              </li>;
        })}
        </ul>
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="w-10 h-10 border-2 border-sidebar-primary">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground font-semibold">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile.education_level && educationLabels[language][profile.education_level]}
              </p>
            </div>}
          {!collapsed && <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0" onClick={onSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('action.signout')}</TooltipContent>
            </Tooltip>}
        </div>
        {collapsed && <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent" onClick={onSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={dir === 'rtl' ? 'left' : 'right'}>
              {t('action.signout')}
            </TooltipContent>
          </Tooltip>}
      </div>
    </aside>;
};
export default AppSidebar;