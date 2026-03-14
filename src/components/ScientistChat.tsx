import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FlaskConical, Send, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useUserProgress } from '@/hooks/useUserProgress';
import ExportButtons from './chat/ExportButtons';

interface ScientistChatProps {
  language: 'ar' | 'en';
}

const scientists = [
  { id: 'einstein', name: { ar: 'ألبرت أينشتاين', en: 'Albert Einstein' }, field: { ar: 'الفيزياء النظرية', en: 'Theoretical Physics' }, emoji: '🧪' },
  { id: 'newton', name: { ar: 'إسحاق نيوتن', en: 'Isaac Newton' }, field: { ar: 'الفيزياء والرياضيات', en: 'Physics & Math' }, emoji: '🍎' },
  { id: 'curie', name: { ar: 'ماري كوري', en: 'Marie Curie' }, field: { ar: 'الكيمياء والفيزياء', en: 'Chemistry & Physics' }, emoji: '⚗️' },
  { id: 'darwin', name: { ar: 'تشارلز داروين', en: 'Charles Darwin' }, field: { ar: 'علم الأحياء', en: 'Biology' }, emoji: '🦎' },
  { id: 'hawking', name: { ar: 'ستيفن هوكينغ', en: 'Stephen Hawking' }, field: { ar: 'الفيزياء الفلكية', en: 'Astrophysics' }, emoji: '🌌' },
  { id: 'alkhwarizmi', name: { ar: 'الخوارزمي', en: 'Al-Khwarizmi' }, field: { ar: 'الرياضيات والجبر', en: 'Mathematics & Algebra' }, emoji: '🔢' },
  { id: 'ibnSina', name: { ar: 'ابن سينا', en: 'Ibn Sina (Avicenna)' }, field: { ar: 'الطب والفلسفة', en: 'Medicine & Philosophy' }, emoji: '🏥' },
  { id: 'ibnAlHaytham', name: { ar: 'ابن الهيثم', en: 'Ibn Al-Haytham' }, field: { ar: 'البصريات والفيزياء', en: 'Optics & Physics' }, emoji: '🔭' },
  { id: 'tesla', name: { ar: 'نيكولا تسلا', en: 'Nikola Tesla' }, field: { ar: 'الهندسة الكهربائية', en: 'Electrical Engineering' }, emoji: '⚡' },
  { id: 'davinci', name: { ar: 'ليوناردو دا فينشي', en: 'Leonardo da Vinci' }, field: { ar: 'الفن والهندسة والعلوم', en: 'Art, Engineering & Science' }, emoji: '🎨' },
  { id: 'turing', name: { ar: 'آلان تورينغ', en: 'Alan Turing' }, field: { ar: 'علوم الحاسوب', en: 'Computer Science' }, emoji: '💻' },
  { id: 'archimedes', name: { ar: 'أرخميدس', en: 'Archimedes' }, field: { ar: 'الرياضيات والفيزياء', en: 'Mathematics & Physics' }, emoji: '🛁' },
  { id: 'jabir', name: { ar: 'جابر بن حيان', en: 'Jabir ibn Hayyan' }, field: { ar: 'الكيمياء', en: 'Chemistry' }, emoji: '🧬' },
  { id: 'galileo', name: { ar: 'جاليليو جاليلي', en: 'Galileo Galilei' }, field: { ar: 'الفلك والفيزياء', en: 'Astronomy & Physics' }, emoji: '🔭' },
  { id: 'razi', name: { ar: 'الرازي', en: 'Al-Razi (Rhazes)' }, field: { ar: 'الطب والكيمياء', en: 'Medicine & Chemistry' }, emoji: '💊' },
  { id: 'noether', name: { ar: 'إيمي نويثر', en: 'Emmy Noether' }, field: { ar: 'الرياضيات والفيزياء', en: 'Mathematics & Physics' }, emoji: '📐' },
];

const ScientistChat: React.FC<ScientistChatProps> = ({ language }) => {
  const { profile } = useProfile();
  const [selectedScientist, setSelectedScientist] = useState('einstein');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const subjectId = `scientist_${selectedScientist}`;
  const { messages, addMessage, loading: messagesLoading } = useChatMessages(subjectId);
  const { progress, saveProgress } = useUserProgress('scientist' as any);

  // Load last selected scientist
  useEffect(() => {
    if (progress?.lastSelectedScientist) {
      setSelectedScientist(progress.lastSelectedScientist);
    }
  }, [progress]);

  // Save selected scientist
  const handleScientistChange = (value: string) => {
    setSelectedScientist(value);
    saveProgress({ lastSelectedScientist: value });
  };

  const currentScientist = scientists.find(s => s.id === selectedScientist)!;

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { ar: 'تحدث مع عالم', en: 'Talk to a Scientist' },
      subtitle: { ar: 'اختر عالماً واسأله أي سؤال!', en: 'Choose a scientist and ask them anything!' },
      selectScientist: { ar: 'اختر العالم', en: 'Select Scientist' },
      placeholder: { ar: 'اكتب سؤالك هنا...', en: 'Type your question here...' },
      send: { ar: 'أرسل', en: 'Send' },
      greeting: { ar: `مرحباً! أنا ${currentScientist.name[language]}. كيف يمكنني مساعدتك اليوم؟`, en: `Hello! I'm ${currentScientist.name[language]}. How can I help you today?` },
    };
    return translations[key]?.[language] || key;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const { validateMessage } = await import('@/utils/inputValidation');
    const validation = validateMessage(userMessage, language);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Save user message
    await addMessage({
      role: 'user',
      content: userMessage,
      subject_id: subjectId
    });

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intelligent-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are ${currentScientist.name.en}, the famous scientist. Respond as if you ARE this scientist, speaking in first person. Share your knowledge, discoveries, and perspectives based on your historical contributions to ${currentScientist.field.en}. Be friendly, educational, and inspiring. Keep responses conversational and engaging. Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`,
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
          ],
          learnerProfile: profile ? {
            name: profile.name,
            educationLevel: profile.education_level,
            learningStyle: profile.learning_style,
            interests: profile.interests,
            preferredLanguage: profile.preferred_language,
          } : null,
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          toast.error(
            language === 'ar'
              ? 'تم تجاوز حد الاستخدام المجاني. يمكنك إضافة مفتاح API الخاص بك في صفحة الملف الشخصي للمتابعة.'
              : 'Free usage limit exceeded. You can add your own API key in the Profile page to continue.',
            { duration: 6000 }
          );
        }
        throw new Error('Failed to fetch');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
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
                setStreamingContent(fullContent);
              } catch { }
            }
          }
        }
      }

      // Save assistant message
      if (fullContent) {
        await addMessage({
          role: 'assistant',
          content: fullContent,
          subject_id: subjectId
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 gsap-theme-animate">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex-1 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center text-2xl sm:text-3xl">
            {currentScientist.emoji}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {messages.length > 0 && (
          <div className="shrink-0 absolute top-4 end-4">
            <ExportButtons
              language={language}
              messages={messages.map(m => ({ role: m.role, content: m.content }))}
              title={`${t('title')} - ${currentScientist.name[language]}`}
            />
          </div>
        )}
      </div>

      <Card className="p-3 sm:p-4 mb-3 sm:mb-4 relative">
        <label className="text-sm font-medium mb-2 block">{t('selectScientist')}</label>
        <Select value={selectedScientist} onValueChange={handleScientistChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scientists.map((scientist) => (
              <SelectItem key={scientist.id} value={scientist.id}>
                <div className="flex items-center gap-2">
                  <span>{scientist.emoji}</span>
                  <span className="text-sm">{scientist.name[language]}</span>
                  <span className="text-muted-foreground text-xs hidden sm:inline">({scientist.field[language]})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-3 sm:p-4">
          {messages.length === 0 && !streamingContent && (
            <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                <AvatarFallback className="text-base sm:text-lg">{currentScientist.emoji}</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-2.5 sm:p-3 max-w-[85%] sm:max-w-[80%]">
                <p className="text-sm">{t('greeting')}</p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={message.id || index} className={`flex gap-2 sm:gap-3 mb-3 sm:mb-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                <AvatarFallback className="text-base sm:text-lg">
                  {message.role === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : currentScientist.emoji}
                </AvatarFallback>
              </Avatar>
              <div className={`rounded-lg p-2.5 sm:p-3 max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))}
          {streamingContent && (
            <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                <AvatarFallback className="text-base sm:text-lg">{currentScientist.emoji}</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-2.5 sm:p-3 max-w-[85%] sm:max-w-[80%]">
                <p className="text-sm whitespace-pre-wrap break-words">{streamingContent}</p>
              </div>
            </div>
          )}
          {isLoading && !streamingContent && (
            <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                <AvatarFallback className="text-base sm:text-lg">{currentScientist.emoji}</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-2.5 sm:p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-2 sm:p-4 border-t">
          <div className="flex gap-1.5 sm:gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('placeholder')}
              className="min-h-[44px] max-h-[100px] sm:max-h-[120px] resize-none text-sm"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="h-10 w-10 sm:h-11 sm:w-11 shrink-0">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScientistChat;

