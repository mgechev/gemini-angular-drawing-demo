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
      'AIzaSyDl7pUUy06HNP5NBzVAYgkx_kYvA0yZn0c'

    );
    return api.getGenerativeModel({ model: 'gemini-pro-vision' });
  }
}