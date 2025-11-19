import { Injectable } from '@angular/core';
import { ChatSource } from '../models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class FakeAiService {
  private intros = [
    'Good question! Here is an easy-to-understand explanation:',
    'Let us take a look at this step by step:',
    'Here is a quick summary:',
  ];

  generateReply(userInput: string) {
    const intro = this.random(this.intros);
    const body = userInput
      ? `You asked: "${userInput}". Here is a possible answer that explains the topic in a structured way.`
      : 'Ask me a question and I will give you a sample answer.';

    const sources: ChatSource[] = [
      {
        id: 'wikipedia-elephant',
        title: 'Wikipedia: Elephantidae',
        url: 'https://en.wikipedia.org/wiki/Elephant',
        description: 'General information about elephants.',
      },
      {
        id: 'blog-example',
        title: 'this could be a blog title or the name of the website',
        url: 'https://example.com/elephants',
      },
    ];

    return {
      content: `${intro}\n\n${body}`,
      sources,
    };
  }

  private random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
