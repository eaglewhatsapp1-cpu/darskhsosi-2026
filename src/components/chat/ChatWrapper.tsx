import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useUploadedMaterials } from '@/hooks/useUploadedMaterials';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { getPersona, getPersonaSystemPrompt, AIPersona } from '@/config/aiPersonas';
import { getSubjectTheme } from '@/utils/subjectColors';
import MaterialSelector from './MaterialSelector';
import TemporaryUpload, { TempFile } from './TemporaryUpload';
import PromptEnhancer from './PromptEnhancer';
import ExportButtons from './ExportButtons';
import SmartSuggestions from './SmartSuggestions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWrapperProps {
  personaId: string;
  profile: Profile;
  language: 'ar' | 'en';
  initialContent?: string;
  showMaterialSelector?: boolean;
  showTempUpload?: boolean;
  showExport?: boolean;
  showSuggestions?: boolean;
  customHeader?: React.ReactNode;
  onOutputGenerated?: (output: string) => void;
}

const ChatWrapper: React.FC<ChatWrapperProps> = ({
  personaId,
  profile,
  language,
  initialContent,
  showMaterialSelector = true,
  showTempUpload = true,
  showExport = true,
  showSuggestions = true,
  customHeader,
  onOutputGenerated
}) => {
  const { materials } = useUploadedMaterials();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialContent || '');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const persona = getPersona(personaId);
  const subjectTheme = getSubjectTheme(profile.subject || 'general');
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const getSelectedMaterialsContent = () => {
    return materials
      .filter(m => selectedMaterials.includes(m.id))
      .map(m => `[${m.file_name}]: ${m.content || 'No content available'}`)
      .join('\n\n');
  };

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const materialContext = getSelectedMaterialsContent();
      const tempFilesContext = tempFiles.map(f => `[Temp: ${f.name}]`).join(', ');
      
      const contextMessage = [
        materialContext && `\n\nMaterials Context:\n${materialContext}`,
        tempFilesContext && `\n\nTemporary Files: ${tempFilesContext}`,
        tempFiles.filter(f => f.type.startsWith('image/')).map(f => f.base64).join('\n')
      ].filter(Boolean).join('');

      const systemPrompt = getPersonaSystemPrompt(
        persona,
        language,
        subjectTheme.nameEn,
        profile.name,
        profile.education_level || 'high',
        profile.learning_style || 'illustrative',
        materials.filter(m => selectedMaterials.includes(m.id)).map(m => m.file_name)
      );

      const { data, error } = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: messageToSend + contextMessage }
          ],
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
          uploadedMaterials: materials.filter(m => selectedMaterials.includes(m.id)).map(m => m.file_name),
          materialContent: getSelectedMaterialsContent(),
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error(t('حدث خطأ.', 'An error occurred.'));
        setIsLoading(false);
        return;
      }

      let fullContent = '';

      // Check if data is a ReadableStream (streaming response)
      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
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
              const content = parsed.choices?.[0]?.delta?.content;
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
      } else if (data && typeof data === 'object') {
        // Handle non-streaming JSON response
        if (data.choices?.[0]?.message?.content) {
          fullContent = data.choices[0].message.content;
          setStreamingContent(fullContent);
        } else if (typeof data === 'string') {
          fullContent = data;
          setStreamingContent(fullContent);
        }
      } else if (typeof data === 'string') {
        fullContent = data;
        setStreamingContent(fullContent);
      }

      if (fullContent) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        onOutputGenerated?.(fullContent);
      }

      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(t('حدث خطأ في الاتصال', 'Connection error'));
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

  const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content || '';

  return (
    <div className="flex flex-col h-full" dir={dir}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        {customHeader || (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: subjectTheme.gradient }}
              >
                {persona.icon}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  {language === 'ar' ? persona.nameAr : persona.nameEn}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? persona.descriptionAr : persona.descriptionEn}
                </p>
              </div>
            </div>
            {showExport && lastAiMessage && (
              <ExportButtons 
                language={language} 
                content={lastAiMessage}
                title={language === 'ar' ? persona.nameAr : persona.nameEn}
              />
            )}
          </div>
        )}
      </div>

      {/* Material Selector */}
      {showMaterialSelector && (
        <div className="p-3 border-b border-border">
          <MaterialSelector
            language={language}
            selectedMaterials={selectedMaterials}
            onSelectionChange={setSelectedMaterials}
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                )}
                style={message.role === 'assistant' ? { background: subjectTheme.gradient } : undefined}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[75%] px-4 py-3 rounded-2xl',
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {streamingContent && (
            <div className="flex gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: subjectTheme.gradient }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-muted">
                <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
              </div>
            </div>
          )}

          {isLoading && !streamingContent && (
            <div className="flex gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: subjectTheme.gradient }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-2xl">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Smart Suggestions */}
      {showSuggestions && messages.length > 0 && !isLoading && (
        <div className="px-4 py-2">
          <SmartSuggestions
            language={language}
            personaId={personaId}
            onSuggestionClick={(suggestion) => handleSend(suggestion)}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/50">
        {showTempUpload && (
          <div className="mb-3">
            <TemporaryUpload
              language={language}
              tempFiles={tempFiles}
              onFilesChange={setTempFiles}
            />
          </div>
        )}
        <div className="flex items-end gap-2">
          <PromptEnhancer
            language={language}
            prompt={input}
            onEnhancedPrompt={setInput}
            disabled={isLoading}
          />
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('اكتب رسالتك...', 'Type your message...')}
            className="flex-1 min-h-[48px] max-h-[120px] resize-none rounded-xl"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12 rounded-xl"
            style={{ background: subjectTheme.gradient }}
          >
            <Send className={cn('w-5 h-5', dir === 'rtl' && 'rotate-180')} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWrapper;
