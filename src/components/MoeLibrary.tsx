import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Library, ExternalLink, Link2, GraduationCap, BookOpen, School, Baby } from 'lucide-react';

interface Props {
  language: 'ar' | 'en';
}

const CATEGORIES = [
  {
    ar: 'رياض الأطفال',
    en: 'Kindergarten',
    url: 'https://studentbooks.moe.gov.eg/books/Books-Kindergarten/',
    Icon: Baby,
    color: 'from-pink-500 to-rose-400',
  },
  {
    ar: 'المرحلة الابتدائية',
    en: 'Primary stage',
    url: 'https://studentbooks.moe.gov.eg/books/Books-Primary/',
    Icon: BookOpen,
    color: 'from-amber-500 to-orange-400',
  },
  {
    ar: 'المرحلة الإعدادية',
    en: 'Preparatory stage',
    url: 'https://studentbooks.moe.gov.eg/books/Books-Preparatory/',
    Icon: School,
    color: 'from-teal-500 to-emerald-400',
  },
  {
    ar: 'المرحلة الثانوية',
    en: 'Secondary stage',
    url: 'https://studentbooks.moe.gov.eg/books/Books-Secondary/',
    Icon: GraduationCap,
    color: 'from-indigo-500 to-violet-400',
  },
];

const MoeLibrary: React.FC<Props> = ({ language }) => {
  const t = (ar: string, en: string) => (language === 'ar' ? ar : en);
  const { fetchMaterials, extractDocumentContent } = useUploadedMaterials();

  const [manualUrl, setManualUrl] = useState('');
  const [importing, setImporting] = useState(false);

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
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Library className="w-6 h-6" />
            {t('المكتبة واستيراد الكتب', 'Library & Book Import')}
          </h1>
          <p className="text-sm opacity-90 mt-1">
            {t(
              'تصفّح كتب وزارة التربية والتعليم حسب المرحلة، أو الصق رابط أي كتاب أو صفحة من أي موقع ليتحول إلى مادة داخل التطبيق.',
              'Browse ministry books by stage, or paste any book or page link from any website to turn it into a material inside the app.'
            )}
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-3">
            {t('كتب وزارة التربية والتعليم', 'Ministry of Education books')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(({ ar, en, url, Icon, color }) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-2xl border bg-card hover:shadow-md transition-shadow"
              >
                <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{language === 'ar' ? ar : en}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t('يفتح صفحة الكتب على موقع الوزارة', 'Opens this stage on the ministry site')}
                  </span>
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {t(
              'بعد فتح الصفحة، انسخ رابط الكتاب والصقه بالأسفل ليُحمَّل ويصبح مادة داخل التطبيق.',
              'After opening the page, copy the book link and paste it below to import it as a material.'
            )}
          </p>
        </div>

        <Card>
          <CardContent className="pt-5 space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              {t('استيراد من أي رابط', 'Import from any link')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(
                'يدعم ملفات PDF وWord والنصوص والصور من أي موقع. وإذا كان الرابط لصفحة ويب، يحوّلها التطبيق إلى نص ويحفظها كمادة.',
                'Supports PDF, Word, text and image files from any site. If the link is a web page, it is converted to text and saved as a material.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') importFromUrl(); }}
                placeholder="https://example.com/book.pdf"
                dir="ltr"
              />
              <Button onClick={importFromUrl} disabled={importing || !manualUrl.trim()} className="w-full sm:w-auto">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : t('استيراد', 'Import')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoeLibrary;
