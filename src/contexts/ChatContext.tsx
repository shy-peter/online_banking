import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatMessage, ChatSession } from '../types/chat';
import { chatService } from '../lib/chatService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  messages: ChatMessage[];
  currentSession: ChatSession | null;
  isOpen: boolean;
  isSending: boolean;
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  startNewSession: (email?: string, phone?: string) => Promise<void>;
  closeSession: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let unsubscribe: any = null;
    if (currentSession) {
      const loadAndSubscribe = async () => {
        // load existing messages
        const sessionMessages = await chatService.getSessionMessages(currentSession.$id!);
        setMessages(sessionMessages);

        // subscribe to realtime messages for this session
        try {
          const sub = await chatService.subscribeToMessages(currentSession.$id!, (msg) => {
            setMessages((prev) => [...prev, msg]);
          });
          unsubscribe = sub;
        } catch (err) {
          console.error('Failed to subscribe to chat messages:', err);
        }
      };
      loadAndSubscribe();
    }

    return () => {
      // cleanup subscription on session change / unmount
      try {
        if (!unsubscribe) return;
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        } else if (unsubscribe.unsubscribe) {
          unsubscribe.unsubscribe();
        } else if (unsubscribe.close) {
          unsubscribe.close();
        }
      } catch (err) {
        // ignore cleanup errors
      }
    };
  }, [currentSession]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const startNewSession = async (email?: string, phone?: string) => {
    try {
      // Create the session and get the full session document back
      const sessionId = await chatService.createSession(user?.$id, email, phone);
      const now = new Date().toISOString();
      const session = {
        $id: sessionId,
        userId: user?.$id,
        email: email,
        phone: phone,
        status: 'active' as const,
        startedAt: now,
        lastActivityAt: now
      };
      setCurrentSession(session);
      setMessages([]);

      // Send initial greeting message from admin
      await chatService.sendMessage(
        sessionId,
        "Welcome! How can we help you today?",
        'admin',
        'system',
        undefined,
        undefined
      );
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw error; // Rethrow to let component handle it
    }
  };

  const sendMessage = async (message: string) => {
    if (!currentSession || isSending) return;

    setIsSending(true);
    try {
      await chatService.sendMessage(
        currentSession.$id!,
        message,
        'user',
        user?.$id,
        currentSession.email,
        currentSession.phone
      );
      // The message will be added to the list through the subscription
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const closeSession = async () => {
    if (!currentSession) return;

    try {
      await chatService.closeSession(currentSession.$id!);
      setCurrentSession(null);
      setMessages([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error closing chat session:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        currentSession,
        isOpen,
        isSending,
        toggleChat,
        sendMessage,
        startNewSession,
        closeSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};