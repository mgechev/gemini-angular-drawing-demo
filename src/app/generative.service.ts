import { Injectable } from '@angular/core';

import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root',
})
export class GenerativeService {
  getModel(apiKey: string): GenerativeModel {
    const api = new GoogleGenerativeAI(apiKey);
    return api.getGenerativeModel({ model: 'gemini-pro-vision' });
  }
}
