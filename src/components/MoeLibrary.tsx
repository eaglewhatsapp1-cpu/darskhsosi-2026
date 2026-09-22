import React, { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, Library, ExternalLink, Link2, GraduationCap, 
  BookOpen, School, Baby, Search, Sparkles, History, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  language: 'ar' | 'en';
}

const CATEGORIES = [
  {
    id: 'kg',
    ar: 'رياض الأطفال',
    en: 'Kindergarten',
    url: 'https://studentbooks.moe.gov.eg/books/Books-Kindergarten/',
    Icon: Baby,
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    description: { ar: 'كتب المرحلة التمهيدية والأنشطة', en: 'KG books and activities' }
  },
  {
    id: 'primary',
    ar: 'المرحلة الابتدائية',
    en: 'Primary stage',
    url: 'https://studentbooks.moe.gov.eg/books/Books-Primary/',
    Icon: BookOpen,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    description: { ar: 'الصفوف من الأول حتى السادس الابتدائي', en: 'Grades 1 to 6 primary' }
  },
  {
    id: 'preparatory',
    ar: 'المرحلة الإعدادية',
    en: 'Preparatory stage',
    url: 'https://studentbooks.moe.gov.eg/books/Books-Preparatory/',
    Icon: School,
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    description: { ar: 'المرحلة المتوسطة لطلاب الإعدادي', en: 'Middle school for prep students' }
  },
  {
    id: 'secondary',
    ar: 'المرحلة الثانوية',
    en: 'Secondary stage',
    url: 'https://studentbooks.moe.gov.eg/books/Books-Secondary/',
    Icon: GraduationCap,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    description: { ar: 'المرحلة الثانوية العامة والفنية', en: 'General and technical secondary' }
  },
interface Entry { name: string; url: string }

const ROOT = 'https://studentbooks.moe.gov.eg/Books/';

const SHORTCUTS = [
  { ar: 'المكتبة الرسمية 2025-2026', en: 'Official 2025-2026 Library', url: ROOT },
];

const MoeLibrary: React.FC<Props> = ({ language }) => {
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);
  const { materials, fetchMaterials, extractDocumentContent, loading } = useUploadedMaterials();

  const [manualUrl, setManualUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return CATEGORIES;
    return CATEGORIES.filter(c => 
      c.ar.includes(searchQuery) || 
      c.en.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const recentImports = useMemo(() => {
    return materials.slice(0, 3);
  }, [materials]);

  const errorMessage = (code: string) => {
    switch (code) {
      case 'invalid_url':
        return t('الرابط غير صالح. تأكد أنه يبدأ بـ https', 'Invalid link. Make sure it starts with https');
      case 'source_unavailable':
        return t('الموقع رفض التحميل التلقائي. جرّب رابطًا مباشرًا للملف.', 'The site refused the download. Try a direct file link.');
      case 'unsupported_type':
        return t('نوع الملف غير مدعوم (المدعوم: PDF، Word، نص، صور).', 'Unsupported file type (PDF, Word, text, images).');
      case 'file_too_large':
        return t('حجم الملف أكبر من 25 ميجابايت.', 'File is larger than 25MB.');
      case 'no_readable_content':
        return t('لم نجد نصًا قابلاً للقراءة في هذه الصفحة.', 'No readable text found on this page.');
      default:
        return t('تعذّر الاستيراد، حاول مرة أخرى.', 'Import failed, please try again.');
    }
  };

  const importFromUrl = async () => {
    const url = manualUrl.trim();
    if (!url) return;
    setImporting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('moe-books', {
        body: { action: 'import', url },
      });
      if (fnError) throw fnError;
      if (data?.error) {
        toast({ title: errorMessage(data.error), variant: 'destructive' });
        return;
      }

      const material = data.material;
      toast({ title: t(`تم استيراد «${material.file_name}» إلى موادك`, `"${material.file_name}" added to your materials`) });
      await fetchMaterials();
      setManualUrl('');

      if (data.kind === 'webpage') {
        toast({ title: t('تم تحويل الصفحة إلى نص جاهز للاستخدام', 'The page was converted to ready-to-use text') });
        return;
      }

      toast({ title: t('جارٍ استخراج المحتوى...', 'Extracting content...') });
      const result = await extractDocumentContent(material.id, material.storage_path, material.file_type);
      toast({
        title: result.success
          ? t('أصبح الملف جاهزًا للاستخدام مع كل خصائص التطبيق', 'The file is ready to use across the app')
          : t('تم الحفظ، لكن تعذّر استخراج النص الآن', 'Saved, but text extraction failed'),
        variant: result.success ? undefined : 'destructive',
      });
    } catch (e) {
      console.error(e);
      toast({ title: errorMessage('unknown'), variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background/50">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 pb-20">
        
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <Library className="w-8 h-8" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md">
                {t('بوابة الكتب الذكية', 'Smart Books Portal')}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
              {t('مكتبة وزارة التربية والتعليم', 'MOE Digital Library')}
            </h1>
            <p className="max-w-2xl text-lg opacity-90 leading-relaxed font-medium">
              {t(
                'حول كتب الوزارة إلى تجربة تعليمية تفاعلية. تصفح، استورد، وابدأ المذاكرة بالذكاء الاصطناعي في ثوانٍ.',
                'Turn ministry books into an interactive learning experience. Browse, import, and start studying with AI in seconds.'
              )}
            </p>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 rounded-full -ml-10 -mb-10 blur-2xl" />
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-primary to-accent text-white shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Library className="w-6 h-6" />
            {t('مكتبة كتب وزارة التربية والتعليم', 'Ministry of Education Book Library')}
          </h1>
          <p className="text-sm opacity-90 mt-1">
            {t(
              'اختر كتابك من كتب الوزارة ليُحمَّل تلقائيًا ويصبح مادة داخل التطبيق تستخدمها مع المعلم الذكي والملخصات والاختبارات.',
              'Pick a ministry book and it is downloaded automatically and becomes a material you can use across the app.'
            )}
          </p>
          <a
            href={ROOT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs mt-3 underline opacity-90"
          >
            {t('فتح موقع المكتبة', 'Open the library site')} <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Search and Browse Section */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {t('تصفح المراحل الدراسية', 'Browse Educational Stages')}
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('ابحث عن مرحلة...', 'Search stages...')}
                    className="pr-10 bg-card border-none shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCategories.map((cat) => (
                  <a
                    key={cat.id}
                    href={cat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col p-5 rounded-2xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-3 rounded-xl border", cat.color)}>
                        <cat.Icon className="w-6 h-6" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{language === 'ar' ? cat.ar : cat.en}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === 'ar' ? cat.description.ar : cat.description.en}
                    </p>
                    <div className="mt-auto flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('زيارة الموقع الرسمي', 'Visit Official Site')}
                      <ArrowRight className={cn("w-3 h-3 mx-1", language === 'ar' ? "rotate-180" : "")} />
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* Import Tool Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-card to-muted/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  {t('استيراد كتاب محدد', 'Import Specific Book')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'انسخ رابط الكتاب من موقع الوزارة والصقه هنا لتحويله لمادة دراسية ذكية.',
                    'Copy the book link from the MOE site and paste it here to convert it into a smart learning material.'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={manualUrl}
                      onChange={e => setManualUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') importFromUrl(); }}
                      placeholder="https://studentbooks.moe.gov.eg/..."
                      dir="ltr"
                      className="bg-background border-2 focus-visible:ring-primary h-12"
                    />
                  </div>
                  <Button 
                    onClick={importFromUrl} 
                    disabled={importing || !manualUrl.trim()} 
                    className="h-12 px-8 font-bold shadow-lg shadow-primary/20"
                  >
                    {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : t('استيراد الآن', 'Import Now')}
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  {t(
                    'نصيحة: يمكنك أيضاً استيراد أي رابط لمقال تعليمي أو صفحة ويب مفيدة بنفس الطريقة.',
                    'Tip: You can also import any link to an educational article or useful web page the same way.'
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  {t('المستورد حديثاً', 'Recently Imported')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ScrollArea className="h-[300px] px-6">
                  {loading ? (
                    <div className="flex flex-col gap-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
                    </div>
                  ) : recentImports.length > 0 ? (
                    <div className="space-y-4">
                      {recentImports.map((item) => (
                        <div key={item.id} className="group relative flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate leading-none mb-1">
                              {item.file_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              {new Date(item.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm text-muted-foreground italic">
                        {t('لا توجد مواد مستوردة بعد', 'No materials imported yet')}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border border-primary/20">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {t('كيف تبدأ؟', 'How to start?')}
              </h4>
              <ul className="text-xs space-y-3 text-muted-foreground font-medium">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                  {t('افتح رابط المرحلة الدراسية أعلاه.', 'Open the educational stage link above.')}
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                  {t('ابحث عن كتابك واضغط عليه بالزر الأيمن واختر "Copy Link".', 'Find your book, right-click and choose "Copy Link".')}
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                  {t('الصق الرابط في مربع الاستيراد واضغط استيراد.', 'Paste the link in the import box and click import.')}
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MoeLibrary;
