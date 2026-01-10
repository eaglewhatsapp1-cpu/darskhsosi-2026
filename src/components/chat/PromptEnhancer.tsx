import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PromptEnhancerProps {
  language: 'ar' | 'en';
  prompt: string;
  onEnhancedPrompt: (enhancedPrompt: string) => void;
  disabled?: boolean;
}

const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  language,
  prompt,
  onEnhancedPrompt,
  disabled = false
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const enhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;

    setIsEnhancing(true);
    setEnhancedPrompt('');

    try {
      const response = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: [
            {
              role: 'user',
              content: language === 'ar'
                ? `أنت مساعد لتحسين أسئلة التعلم. حسّن السؤال التالي ليكون أكثر وضوحاً وتحديداً، مع الحفاظ على المعنى الأصلي. أعد كتابة السؤال فقط بدون شرح إضافي:

"${prompt}"`
                : `You are a learning question improvement assistant. Improve the following question to be clearer and more specific, while maintaining the original meaning. Rewrite the question only without additional explanation:

"${prompt}"`
            }
          ],
          learnerProfile: null
        }
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
              setEnhancedPrompt(fullContent);
            } catch {}
          }
        }
      }

      // Clean up the enhanced prompt
      const cleaned = fullContent
        .replace(/^["']|["']$/g, '')
        .replace(/^السؤال المحسن:\s*/i, '')
        .replace(/^Enhanced question:\s*/i, '')
        .trim();
      
      setEnhancedPrompt(cleaned);
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      setEnhancedPrompt(prompt); // Fallback to original
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAccept = () => {
    onEnhancedPrompt(enhancedPrompt);
    setIsOpen(false);
    setEnhancedPrompt('');
  };

  const handleReject = () => {
    setIsOpen(false);
    setEnhancedPrompt('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={disabled || !prompt.trim()}
          onClick={() => {
            setIsOpen(true);
            enhancePrompt();
          }}
          title={t('تحسين السؤال', 'Enhance Question')}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t('السؤال المحسّن', 'Enhanced Question')}
          </h4>
          
          {isEnhancing ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('جاري التحسين...', 'Enhancing...')}</span>
            </div>
          ) : enhancedPrompt ? (
            <>
              <p className="text-sm p-3 bg-muted/50 rounded-lg">
                {enhancedPrompt}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1 gap-1"
                >
                  <Check className="w-4 h-4" />
                  {t('استخدام', 'Use')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1 gap-1"
                >
                  <X className="w-4 h-4" />
                  {t('إلغاء', 'Cancel')}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PromptEnhancer;
