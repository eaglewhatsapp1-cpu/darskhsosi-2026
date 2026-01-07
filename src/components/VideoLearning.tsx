import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Video, Send, Loader2, Play, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface VideoLearningProps {
  language: 'ar' | 'en';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const VideoLearning: React.FC<VideoLearningProps> = ({ language }) => {
  const { profile } = useProfile();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { ar: 'التعلم بالفيديو', en: 'Learn with Video' },
      subtitle: { ar: 'شاهد فيديو يوتيوب واسأل عن محتواه', en: 'Watch a YouTube video and ask questions about it' },
      urlPlaceholder: { ar: 'الصق رابط فيديو يوتيوب هنا...', en: 'Paste YouTube video URL here...' },
      load: { ar: 'تحميل الفيديو', en: 'Load Video' },
      askPlaceholder: { ar: 'اسأل سؤالاً عن الفيديو...', en: 'Ask a question about the video...' },
      send: { ar: 'أرسل', en: 'Send' },
      greeting: { ar: 'مرحباً! شاهد الفيديو ثم اسألني أي سؤال عن محتواه.', en: 'Hello! Watch the video and then ask me any question about its content.' },
      invalidUrl: { ar: 'رابط يوتيوب غير صالح', en: 'Invalid YouTube URL' },
    };
    return translations[key]?.[language] || key;
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /youtube\.com\/shorts\/([^&\s?]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleLoadVideo = () => {
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !videoId) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('intelligent-teacher', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant discussing a YouTube video. The user is watching: https://youtube.com/watch?v=${videoId}. Help them understand the video content, answer questions about it, and provide additional context. Be educational and engaging. Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`,
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
        },
      });

      if (response.error) throw response.error;

      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

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
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: fullContent };
                return newMessages;
              });
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: language === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {!videoId ? (
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder={t('urlPlaceholder')}
              className="flex-1"
              dir="ltr"
            />
            <Button onClick={handleLoadVideo} disabled={!videoUrl.trim()}>
              <Play className="w-4 h-4 me-2" />
              {t('load')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <Card className="overflow-hidden">
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>

          <Card className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 && (
                <div className="flex gap-3 mb-4">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><MessageSquare className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">{t('greeting')}</p>
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 mb-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {message.role === 'user' ? '👤' : <MessageSquare className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('askPlaceholder')}
                  className="min-h-[44px] max-h-[120px] resize-none"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>

          <Button variant="outline" onClick={() => setVideoId('')}>
            {language === 'ar' ? 'تغيير الفيديو' : 'Change Video'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoLearning;
