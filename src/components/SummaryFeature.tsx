import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileText, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SummaryFeatureProps {
  language: 'ar' | 'en';
}

const SummaryFeature: React.FC<SummaryFeatureProps> = ({ language }) => {
  const { profile } = useProfile();
  const { materials } = useUploadedMaterials();
  const [input, setInput] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const materialsWithContent = materials.filter((m: any) => m.content);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { ar: 'تلخيص المحتوى', en: 'Summarize Content' },
      subtitle: { ar: 'احصل على ملخص شامل لأي نص أو مادة', en: 'Get a comprehensive summary of any text or material' },
      placeholder: { ar: 'الصق النص الذي تريد تلخيصه هنا...', en: 'Paste the text you want to summarize here...' },
      summarize: { ar: 'لخّص', en: 'Summarize' },
      result: { ar: 'الملخص', en: 'Summary' },
      selectMaterial: { ar: 'أو اختر من موادك المرفوعة', en: 'Or select from your uploaded materials' },
      noMaterials: { ar: 'لا توجد مواد مرفوعة بمحتوى نصي', en: 'No uploaded materials with text content' },
      orEnterText: { ar: 'أو أدخل نصاً يدوياً', en: 'Or enter text manually' },
    };
    return translations[key]?.[language] || key;
  };

  const handleSummarize = async () => {
    const contentToSummarize = selectedMaterial 
      ? materialsWithContent.find((m: any) => m.id === selectedMaterial)?.content 
      : input;

    if (!contentToSummarize?.trim() || isLoading) return;

    setIsLoading(true);
    setResult('');

    try {
      const response = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Please provide a comprehensive summary of the following text. Include the main points, key concepts, and important details. Organize the summary with clear sections if the content is long. Here's the text:\n\n${contentToSummarize}`,
            },
          ],
          learnerProfile: profile ? {
            name: profile.name,
            educationLevel: profile.education_level,
            learningStyle: profile.learning_style,
            interests: profile.interests,
            preferredLanguage: profile.preferred_language,
          } : null,
        },
      });

      if (response.error) throw response.error;

      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullContent += content;
              setResult(fullContent);
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Error summarizing:', error);
      setResult(language === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card className="p-4 mb-6">
        {materialsWithContent.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">{t('selectMaterial')}</label>
            <Select value={selectedMaterial} onValueChange={(value) => {
              setSelectedMaterial(value);
              setInput('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectMaterial')} />
              </SelectTrigger>
              <SelectContent>
                {materialsWithContent.map((material: any) => (
                  <SelectItem key={material.id} value={material.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {material.file_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <label className="text-sm font-medium mb-2 block">{t('orEnterText')}</label>
        <Textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSelectedMaterial('');
          }}
          placeholder={t('placeholder')}
          className="min-h-[150px] mb-4 resize-none"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        <Button
          onClick={handleSummarize}
          disabled={(!input.trim() && !selectedMaterial) || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin me-2" />
          ) : (
            <Sparkles className="w-4 h-4 me-2" />
          )}
          {t('summarize')}
        </Button>
      </Card>

      {result && (
        <Card className="p-6 flex-1 overflow-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('result')}
          </h3>
          <div
            className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {result}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SummaryFeature;
