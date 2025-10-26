import { ID, Query } from 'appwrite';
import client, { databases } from './appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'investflow-db';
const CHAT_MESSAGES = 'chat_messages';
const CHAT_SESSIONS = 'chat_sessions';

export interface ChatMessage {
  $id?: string;
  message: string;
  userId?: string;
  email?: string;
  phone?: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'user' | 'admin';
  sessionId: string;
  timestamp: string;
}

export interface ChatSession {
  userId?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'closed';
  startedAt: Date;
  lastActivityAt: Date;
}

export const chatService = {
  async createSession(userId?: string, email?: string, phone?: string): Promise<string> {
    const session = await databases.createDocument(
      DATABASE_ID,
      CHAT_SESSIONS,
      ID.unique(),
      {
        userId,
        email,
        phone,
        status: 'active',
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      }
    );
    return session.$id;
  },

  async sendMessage(
    sessionId: string,
    message: string,
    type: 'user' | 'admin',
    userId?: string,
    email?: string,
    phone?: string
  ): Promise<void> {
    await databases.createDocument(
      DATABASE_ID,
      CHAT_MESSAGES,
      ID.unique(),
      {
        message,
        userId,
        email,
        phone,
        status: 'sent',
        type,
        sessionId,
        timestamp: new Date().toISOString(),
      }
    );

    // Update session last activity
    await databases.updateDocument(
      DATABASE_ID,
      CHAT_SESSIONS,
      sessionId,
      {
        lastActivityAt: new Date().toISOString(),
      }
    );
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CHAT_MESSAGES,
      [
        Query.equal('sessionId', sessionId),
        Query.orderAsc('timestamp'),
      ]
    );
    return response.documents as unknown as ChatMessage[];
  },

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CHAT_SESSIONS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('lastActivityAt'),
      ]
    );
    return response.documents as unknown as ChatSession[];
  },

  async closeSession(sessionId: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      CHAT_SESSIONS,
      sessionId,
      {
        status: 'closed',
        lastActivityAt: new Date().toISOString(),
      }
    );
  },

  async subscribeToMessages(sessionId: string, callback: (message: ChatMessage) => void) {
    // Subscribe to changes in the chat_messages collection
    return client.subscribe(
      `databases.${DATABASE_ID}.collections.${CHAT_MESSAGES}.documents`,
      (response: any) => {
        // Only process new document creation events
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const payload = response.payload as {
            $id: string;
            sessionId: string;
            message: string;
            userId?: string;
            email?: string;
            phone?: string;
            status: 'sent' | 'delivered' | 'read';
            type: 'user' | 'admin';
            timestamp: string;
          };

          // Only process messages for the current session
          if (payload.sessionId === sessionId) {
            const message: ChatMessage = {
              $id: payload.$id,
              message: payload.message,
              userId: payload.userId,
              email: payload.email,
              phone: payload.phone,
              status: payload.status,
              type: payload.type,
              sessionId: payload.sessionId,
              timestamp: payload.timestamp
            };
            callback(message);
          }
        }
      }
    );
  }
};
