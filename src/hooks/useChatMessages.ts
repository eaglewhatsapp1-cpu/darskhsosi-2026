import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  user_id: string;
  subject_id: string | null;
  role: 'user' | 'assistant';
  content: string;
  attachments: string[] | null;
  created_at: string;
}

const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const useChatMessages = (subjectId?: string | null) => {
  const { user } = useAuth();
  
  // If subjectId is provided but not a valid UUID, skip DB operations (local-only mode)
  const isLocalOnly = !!subjectId && !isValidUUID(subjectId);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(!isLocalOnly);

  useEffect(() => {
    if (isLocalOnly) return;
    if (user) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return () => unsubscribe();
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [user, subjectId]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      } else {
        query = query.is('subject_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data as ChatMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Only add if it matches current subject filter
          if (subjectId === undefined || newMessage.subject_id === subjectId) {
            setMessages((prev) => {
              // Check if message already exists
              if (prev.some(m => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addMessage = async (message: { 
    role: 'user' | 'assistant'; 
    content: string; 
    subject_id?: string | null;
    attachments?: string[];
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    // For local-only mode, just add to local state without DB
    if (isLocalOnly) {
      const localMessage: ChatMessage = {
        id: crypto.randomUUID(),
        user_id: user.id,
        role: message.role,
        content: message.content,
        subject_id: message.subject_id || null,
        attachments: message.attachments || null,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, localMessage]);
      return { data: localMessage, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: message.role,
          content: message.content,
          subject_id: message.subject_id || null,
          attachments: message.attachments || null,
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as ChatMessage, error: null };
    } catch (error) {
      console.error('Error adding message:', error);
      return { data: null, error };
    }
  };

  return { messages, loading, addMessage, fetchMessages, setMessages };
};
