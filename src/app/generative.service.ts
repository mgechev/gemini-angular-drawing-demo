import { Injectable } from "@angular/core";

import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class GenerativeService {
  getModel(): GenerativeModel {
    const api = new GoogleGenerativeAI(

      /* Put your API key here  */
      /* Generate an API key at https://makersuite.google.com/app/apikey */
      'REPLACE_WITH_YOUR_API_KEY'

    );
    return api.getGenerativeModel({ model: 'gemini-pro-vision' });
  }
}