import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Lightbulb, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SimplifyFeatureProps {
  language: 'ar' | 'en';
}

const SimplifyFeature: React.FC<SimplifyFeatureProps> = ({ language }) => {
  const { profile } = useProfile();
  const { materials } = useUploadedMaterials();
  const [input, setInput] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const materialsWithContent = materials.filter((m: any) => m.content);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { ar: 'تبسيط المفاهيم', en: 'Simplify Concepts' },
      subtitle: { ar: 'اشرح لي كأنني طفل صغير', en: 'Explain Like I\'m 5' },
      placeholder: { ar: 'اكتب المفهوم أو الفكرة التي تريد تبسيطها...', en: 'Enter the concept you want simplified...' },
      simplify: { ar: 'بسّط لي', en: 'Simplify' },
      result: { ar: 'الشرح المبسط', en: 'Simplified Explanation' },
      selectMaterial: { ar: 'أو اختر من موادك المرفوعة', en: 'Or select from your uploaded materials' },
      orEnterText: { ar: 'أو أدخل مفهوماً', en: 'Or enter a concept' },
    };
    return translations[key]?.[language] || key;
  };

  const handleSimplify = async () => {
    const contentToSimplify = selectedMaterial 
      ? materialsWithContent.find((m: any) => m.id === selectedMaterial)?.content 
      : input;

    if (!contentToSimplify?.trim() || isLoading) return;

    setIsLoading(true);
    setResult('');

    try {
      const response = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Please explain this concept in the simplest possible terms, as if explaining to a 5-year-old child. Use simple words, fun analogies, and examples from everyday life. The concept is: "${contentToSimplify}"`,
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
      console.error('Error simplifying:', error);
      setResult(language === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Lightbulb className="w-8 h-8 text-primary" />
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
          className="min-h-[100px] mb-4 resize-none"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        <Button
          onClick={handleSimplify}
          disabled={(!input.trim() && !selectedMaterial) || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin me-2" />
          ) : (
            <Sparkles className="w-4 h-4 me-2" />
          )}
          {t('simplify')}
        </Button>
      </Card>

      {result && (
        <Card className="p-6 flex-1 overflow-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
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

export default SimplifyFeature;
