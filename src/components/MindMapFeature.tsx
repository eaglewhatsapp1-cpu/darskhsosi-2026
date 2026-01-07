import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Network, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MindMapFeatureProps {
  language: 'ar' | 'en';
}

const MindMapFeature: React.FC<MindMapFeatureProps> = ({ language }) => {
  const { profile } = useProfile();
  const { materials } = useUploadedMaterials();
  const [input, setInput] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const materialsWithContent = materials.filter((m: any) => m.content);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { ar: 'الخريطة الذهنية', en: 'Mind Map' },
      subtitle: { ar: 'حوّل أي موضوع إلى خريطة ذهنية مرئية', en: 'Transform any topic into a visual mind map' },
      placeholder: { ar: 'اكتب الموضوع أو المفهوم الذي تريد تحويله لخريطة ذهنية...', en: 'Enter the topic you want to convert to a mind map...' },
      generate: { ar: 'أنشئ الخريطة', en: 'Generate Map' },
      result: { ar: 'الخريطة الذهنية', en: 'Mind Map' },
      selectMaterial: { ar: 'أو اختر من موادك المرفوعة', en: 'Or select from your uploaded materials' },
      orEnterText: { ar: 'أو أدخل موضوعاً', en: 'Or enter a topic' },
    };
    return translations[key]?.[language] || key;
  };

  const handleGenerate = async () => {
    const contentToMap = selectedMaterial 
      ? materialsWithContent.find((m: any) => m.id === selectedMaterial)?.content 
      : input;

    if (!contentToMap?.trim() || isLoading) return;

    setIsLoading(true);
    setMermaidCode('');

    try {
      const response = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Create a mind map for the following content. Return ONLY valid Mermaid.js mindmap code, nothing else. Use this exact format:
mindmap
  root((Main Topic))
    Branch1
      Sub1
      Sub2
    Branch2
      Sub3
      Sub4

Content to map: ${contentToMap}`,
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
            } catch {}
          }
        }
      }

      // Clean up the mermaid code
      let cleanCode = fullContent.trim();
      if (cleanCode.startsWith('```mermaid')) {
        cleanCode = cleanCode.slice(10);
      }
      if (cleanCode.startsWith('```')) {
        cleanCode = cleanCode.slice(3);
      }
      if (cleanCode.endsWith('```')) {
        cleanCode = cleanCode.slice(0, -3);
      }
      setMermaidCode(cleanCode.trim());
    } catch (error) {
      console.error('Error generating mind map:', error);
      setMermaidCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Network className="w-8 h-8 text-primary" />
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
          onClick={handleGenerate}
          disabled={(!input.trim() && !selectedMaterial) || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin me-2" />
          ) : (
            <Sparkles className="w-4 h-4 me-2" />
          )}
          {t('generate')}
        </Button>
      </Card>

      {mermaidCode && (
        <Card className="p-6 flex-1 overflow-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            {t('result')}
          </h3>
          <div className="bg-muted/50 rounded-lg p-4 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">{mermaidCode}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {language === 'ar' 
              ? 'يمكنك نسخ هذا الكود ولصقه في أي أداة تدعم Mermaid.js لعرض الخريطة الذهنية' 
              : 'You can copy this code and paste it into any Mermaid.js-compatible tool to view the mind map'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default MindMapFeature;
