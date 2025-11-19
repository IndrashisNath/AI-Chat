import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatStoreService } from '../../core/services/chat-store.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatMenuModule,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private store = inject(ChatStoreService);
  autoSave$ = this.store.autoSave$;

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  filteredChats$ = combineLatest([this.store.chats$, this.searchTerm$]).pipe(
    map(([chats, term]) => {
      const lower = term.trim().toLowerCase();
      return chats
        .filter((c) => c.materialized)
        .filter((c) => !lower || c.title.toLowerCase().includes(lower));
    })
  );

  searchTerm = '';

  onNewChat() {
    this.store.startNewChat(true);
  }

  onSelectChat(id: string) {
    this.store.selectChat(id);
  }

  onToggleAutoSave(value: boolean) {
    this.store.toggleAutoSave(value);
  }

  onSearchChange(value: string) {
    this.searchTermSubject.next(value);
  }

  deleteChat(id: string) {
    this.store.deleteChat(id);
  }
}
