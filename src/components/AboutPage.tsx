import React, { useLayoutEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Lightbulb, Users, GraduationCap, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface AboutPageProps {
    language: 'ar' | 'en';
}

const AboutPage: React.FC<AboutPageProps> = ({ language }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    const t = (ar: string, en: string) => (language === 'ar' ? ar : en);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            gsap.from('.about-hero-animate', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                stagger: 0.1
            });

            if (cardsRef.current) {
                gsap.from(cardsRef.current.children, {
                    y: 30,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out',
                    delay: 0.3
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [language]);

    const IconWrapper = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => (
        <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center mb-4 shadow-sm`}>
            {children}
        </div>
    );

    return (
        <div
            ref={containerRef}
            className="h-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col"
            dir={dir}
        >
            <ScrollArea className="flex-1 px-4 py-8 md:py-12 lg:py-16" dir={dir}>
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12 md:mb-16 space-y-4 about-hero-animate">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-2">
                            <GraduationCap className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white">
                            {t('عن "درس خصوصي"', 'About "Dars Khusoosi"')}
                        </h1>
                        <p className="text-xl md:text-2xl font-bold text-primary flex items-center justify-center gap-2">
                            <Heart className="w-6 h-6 fill-current" />
                            {t('رحلة تعليم بتبدأ من القلب', 'A Learning Journey from the Heart')}
                        </p>
                    </div>

                    {/* Main Story Card */}
                    <div className="about-hero-animate mb-12">
                        <Card className="p-6 md:p-10 lg:p-12 border-none shadow-xl bg-white dark:bg-slate-900 relative overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 rounded-[2rem]">
                            <div className={`absolute top-0 ${language === 'ar' ? 'right-0' : 'left-0'} w-2 h-full bg-primary`} />
                            <p className="text-lg md:text-2xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium text-start" style={{ textAlign: 'justify' }}>
                                {t(
                                    'التطبيق ده مش مجرد منصة تعليمية، ده حلم ورسالة. الفكرة اتولدت من أب (EMS) كان بيدور على أحسن وأمتع طريقة يعلم بيها ولاده، وقرر يحول الحلم ده لواقع. "درس خصوصي" هو إهداء خاص جداً وغالي من الوالد لـ "عمر" و "عبد الله"، وعشان الخير بيعم، الإهداء ده كبر عشان يشمل كل طالب وكل إنسان شغوف بيدور على طريقة مختلفة ومبتكرة للتعلم.',
                                    'This app is not just a learning platform; it is a dream and a mission. Born from a father\'s (EMS) search for the best way to teach his children, "Dars Khusoosi" is a precious gift to "Omar" and "Abdullah". This gift has grown to include every student seeking an innovative, heart-led way to learn.'
                                )}
                            </p>
                        </Card>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" ref={cardsRef} style={{ display: 'grid' }}>
                        {/* Why */}
                        <Card className="flex flex-col h-full p-8 border-none shadow-lg bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl transition-transform hover:-translate-y-1 text-start">
                            <IconWrapper colorClass="bg-amber-100 dark:bg-amber-900/30">
                                <Lightbulb className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                            </IconWrapper>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 text-start">
                                {t('لماذا هذا التطبيق؟', 'Why Dars Khusoosi?')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-start">
                                {t(
                                    'أسلوب بيكسر الملل وبيخاطب الفضول، عشان تستمتع بكل معلومة جديدة بتعرفها وبطرق بتحترم ذكاءك.',
                                    'Breaking boredom through curiousity. We respect your intelligence by teaching through discovery.'
                                )}
                            </p>
                        </Card>

                        {/* Charity */}
                        <Card className="flex flex-col h-full p-8 border-none shadow-lg bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl transition-transform hover:-translate-y-1 text-start">
                            <IconWrapper colorClass="bg-rose-100 dark:bg-rose-900/30">
                                <Heart className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                            </IconWrapper>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 text-start">
                                {t('عمل خيري 100%', '100% Charitable')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-start">
                                {t(
                                    'المنصة مجانية بالكامل. هدفنا مساعدة كل عقل عايز يتعلم ويوصل لحلمه بدون أي حواجز مادية.',
                                    'Completely free of charge. Our goal is to break all financial barriers between you and your education.'
                                )}
                            </p>
                        </Card>

                        {/* Legacy */}
                        <Card className="flex flex-col h-full p-8 border-none shadow-lg bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl transition-transform hover:-translate-y-1 text-start">
                            <IconWrapper colorClass="bg-emerald-100 dark:bg-emerald-900/30">
                                <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                            </IconWrapper>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 text-start">
                                {t('إرث يكبر بكم', 'A Growing Legacy')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-start">
                                {t(
                                    'من عمر وعبد الله إلى كل العالم. نبني مجتمعاً يشجع بعضه البعض لنترك أثراً جميلاً.',
                                    'From Omar & Abdullah to the world. Building a supportive community to leave a lasting positive impact.'
                                )}
                            </p>
                        </Card>
                    </div>

                    {/* Personal Message */}
                    <div className="about-hero-animate mb-8">
                        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-8 md:p-10 rounded-[2.5rem] text-center relative overflow-hidden">
                            <Sparkles className="w-10 h-10 text-primary mx-auto mb-6 opacity-80" />
                            <p className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-200 italic leading-snug">
                                {t(
                                    '"وزي ما احنا متفقين دايماً، لو في أي وقت حسيت إنك محتاج تعدل أي حاجة أو في جزء مش عاجبك، أنا دايماً موجود هنا في الشات عشان أظبطلك الدنيا."',
                                    '"As we always agree, if you ever feel something needs adjustment or isn\'t to your liking, I am always here to set things right for you."'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="about-hero-animate">
                        <Card className="p-6 border-none shadow-md bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center gap-4 text-center">
                            <div className="flex items-center gap-3 text-primary font-bold text-lg">
                                <Heart className="w-5 h-5 fill-current" />
                                <span>{t('تواصل معنا', 'Contact Us')}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">
                                {t(
                                    'إذا كنت بحاجة إلى أي تعديلات أو لديك اقتراحات لتحسين التجربة، يسعدنا تواصلك معنا عبر البريد الإلكتروني:',
                                    'If you need any edits or have suggestions to improve the experience, we would love to hear from you via email:'
                                )}
                            </p>
                            <a
                                href="mailto:eeye12433@gmail.com"
                                className="text-xl md:text-2xl font-black text-primary hover:underline transition-all"
                            >
                                eeye12433@gmail.com
                            </a>
                        </Card>
                    </div>

                    <div className="h-20" />
                </div>
            </ScrollArea>
        </div>
    );
};


export default AboutPage;
