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
    $id?: string;
    userId?: string;
    email?: string;
    phone?: string;
    status: 'active' | 'closed';
    startedAt: string;
    lastActivityAt: string;
}