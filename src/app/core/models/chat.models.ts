export type MessageRole = 'user' | 'assistant';

export interface ChatSource {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string; // ISO timestamp for display
  hasSources?: boolean;
  sources?: ChatSource[];
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  materialized: boolean;
}
