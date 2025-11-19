import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Chat } from '../../core/models/chat.models';

@Component({
  selector: 'app-chat-header',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, DatePipe],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss',
})
export class ChatHeaderComponent {
  @Input() chat: Chat | null = null;
  @Input() autoSave = true;
  @Output() saveClicked = new EventEmitter<void>();
}
