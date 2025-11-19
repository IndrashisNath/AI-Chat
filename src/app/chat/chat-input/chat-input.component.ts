import { TextFieldModule } from '@angular/cdk/text-field';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-chat-input',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
  ],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
})
export class ChatInputComponent {
  @Input() loading = false;
  @Output() send = new EventEmitter<string>();

  value = '';
  guidelinesEnabled = true;

  onSendClick() {
    const trimmed = this.value.trim();
    if (!trimmed || this.loading) return;
    this.send.emit(trimmed);
    this.value = '';
  }
}
