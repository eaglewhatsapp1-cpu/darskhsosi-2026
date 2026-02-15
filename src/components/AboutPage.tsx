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

    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            gsap.from('.about-animate-header', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });

            if (cardsRef.current) {
                gsap.from(cardsRef.current.children, {
                    y: 50,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'power3.out',
                    delay: 0.3
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [language]);

    return (
        <div ref={containerRef} className="h-full bg-background/50 overflow-hidden flex flex-col" dir={dir}>
            <ScrollArea className="flex-1 p-4 md:p-8 lg:p-12">
                <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">

                    {/* Main Hero Section */}
                    <div className="text-center space-y-6 about-animate-header">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2">
                            <GraduationCap className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                            {t('عن "درس خصوصي"', 'About "Dars Khusoosi"')}
                        </h1>
                        <p className="text-xl md:text-2xl font-bold text-primary flex items-center justify-center gap-2">
                            {t('رحلة تعليم بتبدأ من القلب ❤️', 'A Learning Journey from the Heart ❤️')}
                        </p>
                        <div className="bg-card/50 backdrop-blur-sm border border-border p-6 md:p-8 rounded-3xl shadow-soft">
                            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                                {t(
                                    'التطبيق ده مش مجرد منصة تعليمية، ده حلم ورسالة. الفكرة اتولدت من أب (EMS) كان بيدور على أحسن وأمتع طريقة يعلم بيها ولاده، وقرر يحول الحلم ده لواقع. "درس خصوصي" هو إهداء خاص جداً وغالي من الوالد لـ "عمر" و "عبد الله"، وعشان الخير بيعم، الإهداء ده كبر عشان يشمل كل طالب وكل إنسان شغوف بيدور على طريقة مختلفة ومبتكرة للتعلم.',
                                    'This app is not just a learning platform; it is a dream and a mission. The idea was born from a father (EMS) seeking the best and most enjoyable way to teach his children, deciding to turn that dream into reality. "Dars Khusoosi" is a very special and precious gift from a father to "Omar" and "Abdullah". Because goodness spreads, this gift has grown to include every student and every passionate individual seeking a different and innovative way to learn.'
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={cardsRef}>
                        {/* Feature 1 */}
                        <Card className="p-6 md:p-8 space-y-4 hover:shadow-lg transition-all duration-300 border-t-4 border-t-amber-500 bg-card/80 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Lightbulb className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                                {t('لماذا أنشأنا هذا التطبيق؟', 'Why this App?')}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t(
                                    'أسلوب بيكسر الملل وبيخاطب الفضول، عشان تستمتع بكل معلومة جديدة بتعرفها وبطرق بتحترم ذكاءك وبتبعد عن الطرق التقليدية.',
                                    'A style that breaks boredom and speaks to curiosity, so you enjoy every new piece of info through methods that respect your intelligence.'
                                )}
                            </p>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="p-6 md:p-8 space-y-4 hover:shadow-lg transition-all duration-300 border-t-4 border-t-rose-500 bg-card/80 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                                {t('عمل خيري 100%', '100% Charitable')}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t(
                                    'المنصة دي مجانية بالكامل ومبنية على أساس خيري، هدفنا الوحيد هو مساعدة كل عقل عايز يتعلم ويوصل لحلمه بدون أي حواجز مادية.',
                                    'This platform is completely free and built on a charitable basis. Our sole goal is to help every mind reach its dream without financial barriers.'
                                )}
                            </p>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="p-6 md:p-8 space-y-4 hover:shadow-lg transition-all duration-300 border-t-4 border-t-emerald-500 bg-card/80 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                                {t('إرث يكبر بكم', 'A Growing Legacy')}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t(
                                    'من عمر وعبد الله، لكل متعلم في أي مكان.. إحنا بنبني مجتمع بيشجع بعضه وبيكبر سوا وبنترك أثر جميل بمرور الوقت بصحبتكم.',
                                    'From Omar and Abdullah to every learner everywhere... we are building a community that encourages each other and grows together with you.'
                                )}
                            </p>
                        </Card>
                    </div>

                    {/* Footer Message */}
                    <div className="bg-primary/5 rounded-3xl p-6 md:p-10 text-center space-y-4 border border-primary/10">
                        <Sparkles className="w-8 h-8 text-primary mx-auto opacity-70" />
                        <p className="text-lg md:text-xl font-medium text-foreground max-w-2xl mx-auto italic">
                            {t(
                                '"وزي ما احنا متفقين دايماً، لو في أي وقت حسيت إنك محتاج تعدل أي حاجة أو في جزء مش عاجبك، أنا دايماً موجود هنا في الشات عشان أظبطلك الدنيا."',
                                '"As we always agree, if at any time you feel you need to adjust anything or there is a part you don\'t like, I am always here in the chat to set things up for you."'
                            )}
                        </p>
                    </div>

                    <div className="h-12" />
                </div>
            </ScrollArea>
        </div>
    );
};

export default AboutPage;
