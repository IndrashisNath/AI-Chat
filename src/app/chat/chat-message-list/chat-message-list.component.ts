import { DatePipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Chat } from '../../core/models/chat.models';

@Component({
  selector: 'app-chat-message-list',
  imports: [MatButtonModule, MatIconModule, DatePipe, NgClass],
  templateUrl: './chat-message-list.component.html',
  styleUrl: './chat-message-list.component.scss',
})
export class ChatMessageListComponent {
  @Input() chat: Chat | null = null;
  @Input() error: string | null = null;

  showSourcesForMessageId: string | null = null;

  toggleSources(messageId: string) {
    this.showSourcesForMessageId =
      this.showSourcesForMessageId === messageId ? null : messageId;
  }
}
