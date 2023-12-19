import { Component, afterNextRender, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CanvasComponent } from './canvas.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule } from '@angular/forms';
import { SpeechService } from './speech.service';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { GenerativeModel } from '@google/generative-ai';
import { GenerativeService } from './generative.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CanvasComponent,
    MatButtonModule,
    FormsModule,
    MatIconModule,
  ],
  template: `
    <app-canvas [width]="400" [height]="400" />
    <section class="prompt-controls">
      <input
        [(ngModel)]="apiKey"
        placeholder="API key"
        class="api-key-input"
        type="text"
      />
      <input
        [disabled]="speechActive"
        [(ngModel)]="prompt"
        placeholder="Type or ask a question..."
        type="text"
      />
      <div class="prompt-config">
        <select [disabled]="speechActive" [(ngModel)]="currentLanguage">
          @for (lang of languages; track lang.lang) {
          <option [value]="lang.lang">{{ lang.label }}</option>
          }
        </select>
        <mat-icon
          [hidden]="true"
          (click)="speechInput()"
          aria-hidden="false"
          aria-label="Microphone"
          fontIcon="microphone"
        />
        <button
          mat-button
          color="primary"
          [class.spinner]="disabled"
          [disabled]="disabled || prompt.length < 5 || speechActive"
          (click)="recognize()"
        >
          Ask
        </button>
      </div>
    </section>
    <div class="answer">
      @if (output !== '') {
      <span><span class="gemini-name">🤖 says:</span> <span [innerHTML]="output"></span></span>
      }
    </div>
    <div class="instructions">
      <details>
        <summary>Instructions</summary>
        This app sends the image from the canvas below and the prompt to Gemini
        Pro Vision. You can enter the prompt with your voice using the Web
        Speech API. The app will read Gemini's response using the Web Speech
        Synthesis API. You can select a language for the Web Speech API from the
        dropdown below.
        <br /><br />
        You can clear the canvas by clicking on the trash bin which appears when
        you move your cursor to the top left of the canvas.
        <br /><br />
        Try drawing something and asking Gemini what's on the canvas!
      </details>
    </div>
  `,
  styleUrl: 'app.component.css',
})
export class AppComponent {
  private canvas = viewChild(CanvasComponent);
  private speech = inject(SpeechService);
  private sanitizer = inject(DomSanitizer);
  private model: GenerativeModel | null = null;
  private generativeService: GenerativeService = inject(GenerativeService);


  protected disabled = false;
  protected speechActive = false;
  protected output: SafeHtml = '';
  protected prompt = '';
  protected languages = this.speech.languages;
  protected currentLanguage = 'en-US';
  protected apiKey = '';

  async speechInput() {
    this.prompt = '';
    this.speechActive = true;

    const prompt = await this.speech.listen(this.currentLanguage);
    this.prompt = prompt;

    this.speechActive = false;

    this.recognize();
  }

  async recognize() {
    if (!this.canvas()) return;
    if (!this.prompt) return;

    console.info('Querying the model with prompt', this.prompt);
    const data = this.canvas()!.getBase64Drawing();
    if (!data) return;

    this.disabled = true;

    this.model = this.generativeService.getModel(this.apiKey);

    try {
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
      
      this.output = this.sanitizer.bypassSecurityTrustHtml(await marked.parse(text));

      console.info('Received output from the model', text);
      await this.say(text);
    } finally {
      this.disabled = false;
    }
  }

  async say(text: string) {
    return this.speech.say(text, this.currentLanguage);
  }
}
