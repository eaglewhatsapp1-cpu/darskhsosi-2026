import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLearner } from '@/contexts/LearnerContext';
import { ChatMessage } from '@/types/learner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Send,
  Paperclip,
  Bot,
  User,
  Sparkles,
  Upload,
} from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { t, dir } = useLanguage();
  const { profile, currentSubject, addMessage, uploadedMaterials } = useLearner();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = currentSubject?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    if (currentSubject) {
      addMessage(currentSubject.id, userMessage);
    }

    setInput('');
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual AI integration)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: uploadedMaterials.length === 0 
          ? t('chat.uploadFirst')
          : `${t('chat.welcome')} ${profile?.name}!`,
        timestamp: new Date().toISOString(),
      };
      
      if (currentSubject) {
        addMessage(currentSubject.id, aiMessage);
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            <p className="text-sm text-muted-foreground">
              {currentSubject?.name || t('app.tagline')}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 animate-float">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('app.welcome')}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {uploadedMaterials.length === 0 
                ? t('chat.uploadFirst')
                : t('chat.welcome')}
            </p>
            {uploadedMaterials.length === 0 && (
              <Button className="mt-6 gradient-accent" size="lg">
                <Upload className="w-5 h-5 me-2" />
                {t('sidebar.upload')}
              </Button>
            )}
          </div>
        ) : (
          messages.map((message) => (
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
                  message.role === 'user'
                    ? 'gradient-accent'
                    : 'gradient-primary'
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
                  message.role === 'user'
                    ? 'chat-bubble-user'
                    : 'chat-bubble-ai'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-60 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString(
                    dir === 'rtl' ? 'ar-SA' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </span>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
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
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-12 w-12 rounded-xl"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="min-h-[48px] max-h-[150px] resize-none pe-12 rounded-xl"
              rows={1}
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
