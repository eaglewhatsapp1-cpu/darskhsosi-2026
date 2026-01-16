import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '@/hooks/useProfile';
import { useChatMessages, ChatMessage } from '@/hooks/useChatMessages';
import { useUploadedMaterials, UploadedMaterial } from '@/hooks/useUploadedMaterials';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import MaterialSelector from '@/components/chat/MaterialSelector';
import {
  Send,
  Paperclip,
  Bot,
  User,
  Sparkles,
  Upload,
  Loader2,
  FileText,
} from 'lucide-react';

interface ChatInterfaceProps {
  profile: Profile;
  language: 'ar' | 'en';
  onNavigateToUpload: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile, language, onNavigateToUpload }) => {
  const { messages, loading: messagesLoading, addMessage } = useChatMessages(null);
  const { materials } = useUploadedMaterials();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        'sidebar.teacher': 'المعلم الذكي',
        'app.tagline': 'منصة التعلم المفتوح بالذكاء الاصطناعي',
        'app.welcome': 'مرحباً بك في رحلة التعلم',
        'chat.placeholder': 'اكتب سؤالك هنا...',
        'chat.thinking': 'يفكر...',
        'sidebar.upload': 'رفع المواد',
      },
      en: {
        'sidebar.teacher': 'Intelligent Teacher',
        'app.tagline': 'AI-Powered Open Learning Platform',
        'app.welcome': 'Welcome to Your Learning Journey',
        'chat.placeholder': 'Type your question here...',
        'chat.thinking': 'Thinking...',
        'sidebar.upload': 'Upload Materials',
      },
    };
    return translations[language][key] || key;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Save user message to database
    await addMessage({
      role: 'user',
      content: userInput,
    });

    try {
      // Get selected material names for context
      const selectedMaterialNames = materials
        .filter(m => selectedMaterials.includes(m.id))
        .map(m => m.file_name);

      // Build message history for context
      const messageHistory = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userInput }
      ];

      // Ensure session is valid before calling function
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error(language === 'ar' ? 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.' : 'Session expired. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Use supabase.functions.invoke instead of direct fetch
      const { data, error } = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: messageHistory,
          learnerProfile: {
            name: profile.name,
            educationLevel: profile.education_level,
            learningStyle: profile.learning_style,
            learningStyles: profile.learning_styles,
            preferredLanguage: profile.preferred_language,
            hobbies: profile.hobbies,
            goals: profile.goals,
            strengths: profile.strengths,
            weaknesses: profile.weaknesses,
          },
          uploadedMaterials: selectedMaterialNames.length > 0 ? selectedMaterialNames : materials.map(m => m.file_name),
          materialContent: materials
            .filter(m => selectedMaterialNames.length > 0 ? selectedMaterialNames.includes(m.file_name) : true)
            .map(m => `[${m.file_name}]: ${m.content || 'No content available'}`)
            .join('\n\n'),
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error(language === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
        setIsLoading(false);
        return;
      }

      // Handle streaming response
      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let textBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                fullContent += content;
                setStreamingContent(fullContent);
              }
            } catch {
              textBuffer = line + '\n' + textBuffer;
              break;
            }
          }
        }

        // Save AI response to database
        if (fullContent) {
          await addMessage({
            role: 'assistant',
            content: fullContent,
          });
        }
      } else if (typeof data === 'string') {
        // Non-streaming response
        await addMessage({
          role: 'assistant',
          content: data,
        });
      }

      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{t('sidebar.teacher')}</h2>
            <p className="text-sm text-muted-foreground">{t('app.tagline')}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && !streamingContent ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 animate-float">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('app.welcome')}
            </h3>
            <p className="text-muted-foreground max-w-md mb-2">
              {language === 'ar' 
                ? `مرحباً ${profile.name}! أنا معلمك الذكي. يمكنني مساعدتك في فهم أي موضوع.`
                : `Hello ${profile.name}! I'm your intelligent teacher. I can help you understand any topic.`}
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              {materials.length === 0 
                ? (language === 'ar' 
                    ? 'ارفع مواد تعليمية للحصول على تجربة تعلم مخصصة أكثر.' 
                    : 'Upload learning materials for a more personalized learning experience.')
                : (language === 'ar'
                    ? `لديك ${materials.length} ملفات مرفوعة. اسألني عن أي شيء!`
                    : `You have ${materials.length} files uploaded. Ask me anything!`)}
            </p>
            {materials.length === 0 && (
              <Button className="mt-6 gradient-accent" size="lg" onClick={onNavigateToUpload}>
                <Upload className="w-5 h-5 me-2" />
                {t('sidebar.upload')}
              </Button>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-slide-up',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    message.role === 'user' ? 'gradient-accent' : 'gradient-primary'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-accent-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[75%] px-4 py-3',
                    message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {new Date(message.created_at).toLocaleTimeString(
                      dir === 'rtl' ? 'ar-SA' : 'en-US',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </span>
                </div>
              </div>
            ))}
            
            {streamingContent && (
              <div className="flex gap-3 animate-slide-up">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="chat-bubble-ai max-w-[75%] px-4 py-3">
                  <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                </div>
              </div>
            )}
          </>
        )}
        
        {isLoading && !streamingContent && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="chat-bubble-ai px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('chat.thinking')}</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm space-y-3">
        {/* Material Selector Dropdown */}
        {materials.length > 0 && (
          <MaterialSelector
            language={language}
            selectedMaterials={selectedMaterials}
            onSelectionChange={setSelectedMaterials}
            maxSelection={5}
          />
        )}
        
        <div className="flex items-end gap-3">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-12 w-12 rounded-xl"
            onClick={onNavigateToUpload}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="min-h-[48px] max-h-[150px] resize-none pe-12 rounded-xl"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 h-12 w-12 rounded-xl gradient-primary hover:opacity-90 transition-opacity"
            size="icon"
          >
            <Send className={cn('w-5 h-5', dir === 'rtl' && 'rotate-180')} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
