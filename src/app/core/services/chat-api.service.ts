import { Injectable } from '@angular/core';
import { FakeAiService } from './fake-ai.service';
import { delay, Observable, of, throwError } from 'rxjs';
import { ChatMessage } from '../models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class ChatApiService {
  constructor(private fakeAi: FakeAiService) {}

  sendMessage(userContent: string): Observable<ChatMessage> {
    const latency = 600 + Math.random() * 600;

    // 10% chance to show error state
    if (Math.random() < 0.1) {
      return throwError(
        () => new Error('Something went wrong. Please try again later.')
      ).pipe(delay(latency));
    }

    const { content, sources } = this.fakeAi.generateReply(userContent);

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      createdAt: new Date().toISOString(),
      hasSources: true,
      sources,
    };

    return of(message).pipe(delay(latency));
  }
}
