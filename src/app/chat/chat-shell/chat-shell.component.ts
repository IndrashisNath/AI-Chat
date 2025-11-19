import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ChatApiService } from '../../core/services/chat-api.service';
import { ChatStoreService } from '../../core/services/chat-store.service';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatMessageListComponent } from '../chat-message-list/chat-message-list.component';

@Component({
  selector: 'app-chat-shell',
  imports: [
    AsyncPipe,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    ChatHeaderComponent,
    ChatMessageListComponent,
    ChatInputComponent,
  ],
  templateUrl: './chat-shell.component.html',
  styleUrl: './chat-shell.component.scss',
})
export class ChatShellComponent {
  private store = inject(ChatStoreService);
  private api = inject(ChatApiService);

  currentChat$ = this.store.currentChat$;
  autoSave$ = this.store.autoSave$;
  loading$ = this.store.loading$;
  error$ = this.store.error$;

  onSend(message: string) {
    if (!message.trim()) return;

    this.store.addUserMessage(message);
    this.store.setLoading(true);

    this.api.sendMessage(message).subscribe({
      next: (reply) => {
        this.store.addAssistantMessage(reply);
        this.store.setLoading(false);
      },
      error: (err) => {
        this.store.setLoading(false);
        this.store.setError(err.message ?? 'Unexpected error');
      },
    });
  }

  onSaveChat() {
    this.store.saveCurrentChat();
  }
}
