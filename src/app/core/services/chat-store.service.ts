import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Chat, ChatMessage } from '../models/chat.models';

const STORAGE_CHATS_KEY = 'ai-chat-chats';
const STORAGE_SETTINGS_KEY = 'ai-chat-settings';

interface Settings {
  autoSave: boolean;
}

/**
 * ChatStoreService
 * ----------------
 * Central state management service for the entire chat application.
 *
 * Responsibilities:
 *  - Manage list of chats (materialised & non-materialised)
 *  - Manage currently selected chat
 *  - Handle persistence to localStorage
 *  - Enforce materialisation rules
 *  - Apply Auto-Save logic
 *  - Provide loading/error state for UI
 *
 * A Chat progresses through two phases:
 *   1. Unmaterialised (empty chat, not stored, not visible in sidebar)
 *   2. Materialised (stored in localStorage & visible in sidebar)
 *
 * A chat becomes materialised when:
 *   - Auto-Save = ON and the user sends the first message
 *   - Auto-Save = OFF and at least one user message and user clicks the "Save Chat" button
 *
 * Chats are NEVER persisted until they are materialised.
 */

@Injectable({
  providedIn: 'root',
})
export class ChatStoreService {
  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  private currentChatIdSubject = new BehaviorSubject<string | null>(null);
  private autoSaveSubject = new BehaviorSubject<boolean>(true); // default ON
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  chats$ = this.chatsSubject.asObservable();
  currentChatId$ = this.currentChatIdSubject.asObservable();
  autoSave$ = this.autoSaveSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  currentChat$ = combineLatest([this.chats$, this.currentChatId$]).pipe(
    map(([chats, id]) => chats.find((c) => c.id === id) ?? null)
  );

  constructor() {
    this.restoreFromStorage();

    // Ensure at least one chat exists during fresh load
    if (!this.currentChatIdSubject.value) {
      const chat = this.startNewChat(true);
      this.currentChatIdSubject.next(chat.id);
    }
  }

  /**
   * Creates a brand new EMPTY chat (unmaterialised).
   */
  startNewChat(selectAfterCreate = true, baseList?: Chat[]): Chat {
    const now = new Date().toISOString();

    const chat: Chat = {
      id: crypto.randomUUID(),
      title: '',
      createdAt: now,
      updatedAt: now,
      messages: [],
      materialized: false,
    };

    // Insert the chat at the top of the list
    const chats = [chat, ...(baseList ?? this.chatsSubject.value)];
    this.chatsSubject.next(chats);

    if (selectAfterCreate) {
      this.currentChatIdSubject.next(chat.id);
    }

    // Only persist if chat is already materialized.
    if (chat.materialized) {
      this.persist();
    }

    return chat;
  }

  /**
   * Selects a chat by ID.
   * Also stores the selection in localStorage for persistence across refresh.
   */
  selectChat(id: string) {
    this.currentChatIdSubject.next(id);
    this.errorSubject.next(null);
    localStorage.setItem('ai-chat-currentChatId', id);
  }

  /**
   * Toggles Auto-Save setting and persists it immediately.
   */
  toggleAutoSave(value: boolean) {
    this.autoSaveSubject.next(value);
    this.persistSettings();
  }

  /**
   * Sets loading indicator.
   * Automatically clears previous errors when new loading starts.
   */
  setLoading(value: boolean) {
    this.loadingSubject.next(value);
    if (value) this.errorSubject.next(null);
  }

  /**
   * Stores backend/API error for display in UI.
   */
  setError(message: string | null) {
    this.errorSubject.next(message);
  }

  /**
   * Adds a user message to the currently active chat.
   */
  addUserMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;

    const chat = this.getCurrentChat();
    if (!chat) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const isFirstMessage = chat.messages.length === 0;

    const updated: Chat = {
      ...chat,
      messages: [...chat.messages, msg],
      title: isFirstMessage ? this.deriveTitle(trimmed) : chat.title,
      updatedAt: new Date().toISOString(),
      materialized:
        chat.materialized || (this.autoSaveSubject.value && isFirstMessage),
    };

    this.updateChat(updated);
    this.autoPersist();
  }

  /**
   * Adds an assistant (AI) message to current chat.
   */
  addAssistantMessage(message: ChatMessage) {
    const chat = this.getCurrentChat();
    if (!chat) return;

    const updated: Chat = {
      ...chat,
      messages: [...chat.messages, message],
      updatedAt: new Date().toISOString(),
      materialized: chat.materialized,
    };

    this.updateChat(updated);
    this.autoPersist();
  }

  /**
   * Saves a chat manually when Auto-Save = OFF.
   * This materialises the chat and persists it.
   */
  saveCurrentChat() {
    const chat = this.getCurrentChat();
    if (!chat) return;

    const updated: Chat = {
      ...chat,
      materialized: true,
      updatedAt: new Date().toISOString(),
    };

    this.updateChat(updated);
    this.persist();
  }

  /**
   * Deletes a chat completely from memory AND localStorage.
   */
  deleteChat(id: string) {
    const remaining = this.chatsSubject.value.filter((c) => c.id !== id);
    this.chatsSubject.next(remaining);
    this.persist();

    const newChat = this.startNewChat(true, remaining);
    this.currentChatIdSubject.next(newChat.id);
    localStorage.setItem('ai-chat-currentChatId', newChat.id);
  }

  // ---------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------

  /** Returns the currently selected Chat object (or null if not found). */
  private getCurrentChat(): Chat | null {
    const id = this.currentChatIdSubject.value;
    return this.chatsSubject.value.find((c) => c.id === id) ?? null;
  }

  /** Updates a single chat inside the chat list (immutable update). */
  private updateChat(updated: Chat) {
    const chats = this.chatsSubject.value.map((c) =>
      c.id === updated.id ? updated : c
    );
    this.chatsSubject.next(chats);
  }

  /** Builds a title from the first user message. */
  private deriveTitle(firstMessage: string): string {
    const t = firstMessage.trim();
    if (!t) return 'New chat';
    return t.length > 40 ? t.slice(0, 37) + '…' : t;
  }

  /**
   * Persists ONLY when Auto-Save is ON.
   * Used after sending messages.
   */
  private autoPersist() {
    if (this.autoSaveSubject.value) {
      this.persist();
    }
  }

  /**
   * Persists only *materialised* chats to localStorage.
   * Sidebar and storage displays materialised chats only
   */
  private persist() {
    try {
      const materialisedChats = this.chatsSubject.value.filter(
        (c) => c.materialized
      );

      localStorage.setItem(
        STORAGE_CHATS_KEY,
        JSON.stringify(materialisedChats)
      );

      this.persistSettings();
    } catch {}
  }

  /** Saves current Auto-Save settings to localStorage. */
  private persistSettings() {
    const settings: Settings = { autoSave: this.autoSaveSubject.value };
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * Restores chats, selected chat ID, and settings from localStorage.
   */
  private restoreFromStorage() {
    try {
      const rawChats = localStorage.getItem(STORAGE_CHATS_KEY);
      const rawSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
      const rawCurrentId = localStorage.getItem('ai-chat-currentChatId');

      if (rawChats) {
        const parsed: any[] = JSON.parse(rawChats);
        const chats: Chat[] = parsed.map((c) => ({
          materialized: !!c.materialized,
          ...c,
        }));

        this.chatsSubject.next(chats);

        if (rawCurrentId && chats.some((c) => c.id === rawCurrentId)) {
          this.currentChatIdSubject.next(rawCurrentId);
        } else if (chats.length > 0) {
          this.currentChatIdSubject.next(chats[0].id);
        }
      }

      if (rawSettings) {
        const settings: Settings = JSON.parse(rawSettings);
        this.autoSaveSubject.next(settings.autoSave);
      }
    } catch {}
  }
}
