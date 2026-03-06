import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useChatHistory = (featureId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load messages from database
  const loadMessages = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_id', featureId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at)
        })));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
    }
  }, [user, featureId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Save a single message to database
  const saveMessage = useCallback(async (message: ChatMessage) => {
    if (!user) return;
    try {
      await supabase.from('chat_messages').insert({
        id: message.id,
        user_id: user.id,
        role: message.role,
        content: message.content,
        subject_id: featureId,
      });
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  }, [user, featureId]);

  // Add message locally and persist
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    saveMessage(message);
  }, [saveMessage]);

  // Clear chat history
  const clearHistory = useCallback(async () => {
    if (!user) return;
    try {
      // We can't delete with current RLS (no DELETE policy on chat_messages)
      // So just clear local state
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  }, [user]);

  return { messages, setMessages, addMessage, loading, clearHistory, loadMessages };
};
