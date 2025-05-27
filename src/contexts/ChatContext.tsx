import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  editing?: boolean;
}

type SetMessagesFunction = (messages: Message[] | ((prevMessages: Message[]) => Message[])) => void;

interface ChatContextType {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  messages: Message[];
  setMessages: SetMessagesFunction;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, _setMessages] = useState<Message[]>([]);

  // Create a stable setMessages function that can handle both direct values and updater functions
  const setMessages: SetMessagesFunction = useCallback((arg) => {
    if (typeof arg === 'function') {
      _setMessages(prev => {
        const newMessages = arg(prev);
        return Array.isArray(newMessages) ? newMessages : prev;
      });
    } else {
      _setMessages(Array.isArray(arg) ? arg : []);
    }
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = {
    messages,
    setMessages,
    addMessage,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
