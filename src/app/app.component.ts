import { Component, ViewChild, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CanvasComponent } from './canvas.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


import { FormsModule } from '@angular/forms';
import { SpeechService } from './speech.service';
import { GenerativeService } from './generative.service';
import { GenerativeModel } from '@google/generative-ai';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CanvasComponent,
    MatButtonModule,
    FormsModule,
    MatIconModule
  ],
  template: `
    <app-canvas [width]="400" [height]="400" />
    <section class="prompt">
      <input
        [disabled]="speechActive"
        [(ngModel)]="prompt"
        placeholder="Type a question..."
        type="text"
      />
      <mat-icon (click)="speechInput()" aria-hidden="false" aria-label="Microphone" fontIcon="microphone"/>
      <button
        mat-button
        color="primary"
        [class.spinner]="disabled"
        [disabled]="disabled || prompt.length < 5 || speechActive"
        (click)="recognize()"
      >
        Ask
      </button>
    </section>
    <div class="answer">
      @if (output !== '') {
        <span><span class="gemini-name">🤖 says:</span> {{ output }}</span>
      }
    </div>
  `,
  styleUrl: 'app.component.css',
})
export class AppComponent {
  protected disabled = false;
  protected speechActive = false;
  protected output = '';
  protected prompt = '';

  private speech = inject(SpeechService);
  private generativeService: GenerativeService = inject(GenerativeService);
  private model: GenerativeModel | null = null;
  @ViewChild(CanvasComponent) private canvas: CanvasComponent | null = null;

  constructor() {
    afterNextRender(() => {
      this.model = this.generativeService.getModel();
    });
  }

  async speechInput() {
    this.prompt = '';
    this.speechActive = true;

    const prompt = await this.speech.listen();
    this.prompt = prompt;

    this.speechActive = false;

    await this.recognize();
  }

  async recognize() {
    if (!this.model) return;
    if (!this.canvas) return;
    if (!this.prompt) return;

    const data = this.canvas.getBase64Drawing();
    if (!data) return;

    this.disabled = true;

    const result = await this.model.generateContent([
      this.prompt,
      {
        inlineData: {
          data,
          mimeType: 'image/png',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    this.output = text;
    this.say(this.output);

    this.disabled = false;
  }

  say(text: string) {
    this.speech.say(text);
  }
}
