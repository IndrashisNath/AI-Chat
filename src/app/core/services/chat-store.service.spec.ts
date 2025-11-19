import { TestBed } from '@angular/core/testing';
import { ChatStoreService } from './chat-store.service';

describe('ChatStoreService', () => {
  let service: ChatStoreService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [ChatStoreService],
    });

    service = TestBed.inject(ChatStoreService);
  });

  it('should materialise a chat after the first user message when auto-save is ON', () => {
    service.toggleAutoSave(true);
    const chat = service.startNewChat(true);
    expect(chat.materialized).toBeFalse();

    service.addUserMessage('Hello world');

    const updatedChat = service['getCurrentChat']();
    expect(updatedChat?.materialized).toBeTrue();

    const stored = JSON.parse(localStorage.getItem('ai-chat-chats') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].messages.length).toBe(1);
  });

  it('should delete a chat and replace it with a fresh empty chat', () => {
    const chat = service.startNewChat(true);

    service.addUserMessage('Hello');
    const chatId = chat.id;

    const beforeDelete = JSON.parse(
      localStorage.getItem('ai-chat-chats') || '[]'
    );
    expect(beforeDelete.some((c: any) => c.id === chatId)).toBeTrue();

    service.deleteChat(chatId);

    const afterDelete = JSON.parse(
      localStorage.getItem('ai-chat-chats') || '[]'
    );
    expect(afterDelete.some((c: any) => c.id === chatId)).toBeFalse();

    const current = service['getCurrentChat']();
    expect(current).toBeTruthy();
    expect(current?.messages.length).toBe(0);
    expect(current?.materialized).toBeFalse();
  });

  it('should materialise a chat only when saveCurrentChat() is called if auto-save is OFF', () => {
    service.toggleAutoSave(false);
    const chat = service.startNewChat(true);

    service.addUserMessage('Test message');
    
    let updated = service['getCurrentChat']();
    expect(updated?.materialized).toBeFalse();

    service.saveCurrentChat();
    updated = service['getCurrentChat']();

    expect(updated?.materialized).toBeTrue();

    const stored = JSON.parse(localStorage.getItem('ai-chat-chats') || '[]');
    expect(stored.length).toBe(1);
  });
});
