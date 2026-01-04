import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLearner } from '@/contexts/LearnerContext';
import { SidebarFeature } from '@/types/learner';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Upload,
  Network,
  Lightbulb,
  FileText,
  Users,
  Video,
  ClipboardCheck,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const features: { id: SidebarFeature; icon: React.ElementType }[] = [
  { id: 'teacher', icon: GraduationCap },
  { id: 'upload', icon: Upload },
  { id: 'mindmap', icon: Network },
  { id: 'simplify', icon: Lightbulb },
  { id: 'summary', icon: FileText },
  { id: 'scientist', icon: Users },
  { id: 'video', icon: Video },
  { id: 'test', icon: ClipboardCheck },
  { id: 'progress', icon: TrendingUp },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle }) => {
  const { t, dir } = useLanguage();
  const { profile, activeFeature, setActiveFeature } = useLearner();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar flex flex-col transition-all duration-300 border-e border-sidebar-border',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-accent">
              <GraduationCap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-lg leading-tight">
                {t('app.name')}
              </h1>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
        >
          {dir === 'rtl' ? (
            collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
          ) : (
            collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1 px-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;

            const button = (
              <button
                onClick={() => setActiveFeature(feature.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-accent'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">
                    {t(`sidebar.${feature.id}`)}
                  </span>
                )}
              </button>
            );

            return (
              <li key={feature.id}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side={dir === 'rtl' ? 'left' : 'right'}>
                      {t(`sidebar.${feature.id}`)}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  button
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="w-10 h-10 border-2 border-sidebar-primary">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground font-semibold">
              {profile ? getInitials(profile.name) : '?'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && profile && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {t(`education.${profile.educationLevel}`)}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
