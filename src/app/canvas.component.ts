/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ElementRef, HostListener, input, ViewChild, afterNextRender, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-canvas',
  standalone: true,
  template: `
    <mat-icon (click)="erase()" aria-hidden="false" aria-label="Erase" fontIcon="delete_outline"></mat-icon>
    <canvas [width]="width()" [height]="height()" #canvas></canvas> 
  `,
  imports: [MatIconModule],
  styles: `
    canvas {
      border: 1px solid gray;
    }

    :host {
      position: relative;
      display: inline-block;
    }

    mat-icon {
      position: absolute;
      top: 0px;
      left: 0px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }

    mat-icon:hover {
      opacity: 1;
    }
  `
})
export class CanvasComponent {
  width = input(500);
  height = input(500);

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private drawing = false;
  private pointBuffer: { x: number; y: number }[] = [];

  constructor() {
    afterNextRender(() => {
      this.erase();
    });
  }

  @HostListener('mousedown', ['$event'])
  private startDrawing() {
    this.drawing = true;
  }

  @HostListener('mousemove', ['$event'])
  private draw(event: MouseEvent) {
    if (!this.drawing) return;
    if (!this.canvas()) return;

    const el = this.canvas()!.nativeElement as HTMLCanvasElement;
    const context = el.getContext('2d');

    if (!context) return;

    const rect = el.getBoundingClientRect();

    this.pointBuffer.push({
      x: event.x - rect.left,
      y: event.y - rect.top,
    });

    if (this.pointBuffer.length < 3) {
      return;
    }

    context.moveTo(this.pointBuffer[0].x, this.pointBuffer[0].y);

    context.bezierCurveTo(
      this.pointBuffer[0].x,
      this.pointBuffer[0].y,
      this.pointBuffer[1].x,
      this.pointBuffer[1].y,
      this.pointBuffer[2].x,
      this.pointBuffer[2].y
    );

    this.pointBuffer.shift();
    context.stroke();
  }

  @HostListener('document:mouseup')
  private stopDrawing() {
    this.drawing = false;
    this.pointBuffer = [];
  }

  getBase64Drawing() {
    if (!this.canvas()) return null;
    return (this.canvas()!.nativeElement as HTMLCanvasElement).toDataURL().replace('data:image/png;base64,', '');
  }

  erase() {
    if (!this.canvas()) return;
    const el = this.canvas()!.nativeElement as HTMLCanvasElement;
    const context = el.getContext('2d');

    if (!context) return;

    this.pointBuffer = [];

    context.reset();

    context.strokeStyle = '#000000';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, this.width(), this.height());
    context.fill();
  }
}
