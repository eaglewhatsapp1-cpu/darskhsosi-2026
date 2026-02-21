import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Users,
    Video,
    ExternalLink,
    Plus,
    Calendar,
    Clock,
    MessageSquare,
    Shield,
    Presentation,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VirtualClassroomProps {
    language: 'ar' | 'en';
}

const VirtualClassroom: React.FC<VirtualClassroomProps> = ({ language }) => {
    const [meetingLink, setMeetingLink] = useState('');

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            ar: {
                'title': 'القاعة الافتراضية',
                'subtitle': 'تواصل مع المعلمين والزملاء في بث مباشر',
                'enterLink': 'أدخل رابط الاجتماع (Zoom, Meet, Teams)',
                'joinNow': 'انضم الآن',
                'scheduleTitle': 'اللقاءات القادمة',
                'noMeetings': 'لا توجد اجتماعات مجدولة حالياً',
                'createMeeting': 'إنشاء جلسة جديدة',
                'placeholder': 'https://zoom.us/j/...',
                'recommendTeachers': 'معلمون متاحون الآن',
                'platformSupport': 'المنصات المدعومة',
                'teamsDesc': 'مثالي للدراسة الجماعية',
                'zoomDesc': 'محاضرات المعلمين المباشرة',
                'meetDesc': 'سهل وسريع للمراجعة',
                'invalidLink': 'الرجاء إدخال رابط صحيح',
                'copied': 'تم النسخ!',
            },
            en: {
                'title': 'Virtual Classroom',
                'subtitle': 'Connect with teachers and peers in real-time',
                'enterLink': 'Enter meeting link (Zoom, Meet, Teams)',
                'joinNow': 'Join Now',
                'scheduleTitle': 'Upcoming Sessions',
                'noMeetings': 'No scheduled meetings yet',
                'createMeeting': 'Create New Session',
                'placeholder': 'https://zoom.us/j/...',
                'recommendTeachers': 'Teachers Available Now',
                'platformSupport': 'Supported Platforms',
                'teamsDesc': 'Great for study groups',
                'zoomDesc': 'Direct teacher lectures',
                'meetDesc': 'Quick and easy review',
                'invalidLink': 'Please enter a valid link',
                'copied': 'Copied!',
            }
        };
        return translations[language][key] || key;
    };

    const platforms = [
        { name: 'Zoom', icon: Video, color: 'bg-blue-500', desc: t('zoomDesc') },
        { name: 'Google Meet', icon: Users, color: 'bg-green-500', desc: t('meetDesc') },
        { name: 'MS Teams', icon: Shield, color: 'bg-indigo-500', desc: t('teamsDesc') },
    ];

    const handleJoin = () => {
        if (!meetingLink.trim() || !meetingLink.startsWith('http')) {
            toast.error(t('invalidLink'));
            return;
        }
        window.open(meetingLink, '_blank');
    };

    const upcomingSessions = [
        { id: 1, title: language === 'ar' ? 'مراجعة الرياضيات - الدوال' : 'Math Review - Functions', teacher: language === 'ar' ? 'أ. أحمد علي' : 'Mr. Ahmed Ali', time: '18:00', duration: '45m' },
        { id: 2, title: language === 'ar' ? 'محاضرة الفيزياء النووية' : 'Nuclear Physics Lecture', teacher: language === 'ar' ? 'د. سارة' : 'Dr. Sarah', time: '20:30', duration: '60m' },
    ];

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 custom-scrollbar gsap-theme-animate">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Presentation className="w-8 h-8 text-primary" />
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>
                    <Button className="gradient-primary shadow-glow h-12 px-6 rounded-xl">
                        <Plus className="w-5 h-5 me-2" />
                        {t('createMeeting')}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Join Card */}
                    <Card className="lg:col-span-2 p-6 border-primary/20 bg-primary/5/30 backdrop-blur-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-500"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="meeting-link" className="text-base font-semibold">{t('enterLink')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="meeting-link"
                                        placeholder={t('placeholder')}
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        className="h-14 bg-background/80 text-lg border-2 focus:border-primary transition-all duration-300"
                                        dir="ltr"
                                    />
                                    <Button
                                        onClick={handleJoin}
                                        className="h-14 px-8 gradient-primary shadow-lg hover:shadow-primary/20 transition-all duration-300"
                                    >
                                        <ExternalLink className="w-5 h-5 me-2" />
                                        {t('joinNow')}
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-4">{t('platformSupport')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {platforms.map((p) => (
                                        <div key={p.name} className="flex flex-col p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-help">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={cn("w-2 h-2 rounded-full", p.color)}></div>
                                                <span className="font-medium text-sm">{p.name}</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Schedule */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {t('scheduleTitle')}
                        </h2>
                        <div className="space-y-4">
                            {upcomingSessions.map((session) => (
                                <div key={session.id} className="p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors cursor-pointer group">
                                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{session.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {session.teacher}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {session.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {upcomingSessions.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">{t('noMeetings')}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Community/Teachers Grid */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        {t('recommendTeachers')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="p-4 hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground">
                                            {['A', 'S', 'M', 'K'][i - 1]}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">
                                            {language === 'ar'
                                                ? ['أ. سارة', 'أ. محمد', 'د. ليلى', 'أ. خالد'][i - 1]
                                                : ['Ms. Sara', 'Mr. Mohamed', 'Dr. Leila', 'Mr. Khaled'][i - 1]}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {language === 'ar'
                                                ? ['اللغة العربية', 'الرياضيات', 'العلوم', 'الإنجليزية'][i - 1]
                                                : ['Arabic', 'Mathematics', 'Science', 'English'][i - 1]}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full text-xs h-9 hover:bg-primary hover:text-white transition-all duration-300">
                                    {language === 'ar' ? 'طلب انضمام' : 'Request Join'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualClassroom;
