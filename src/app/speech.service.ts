import { Injectable } from "@angular/core";

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  listen(): Promise<string> {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.start();

    return new Promise((resolve, reject) => {
      recognition.onresult = (event: any) => {
        resolve(event.results[0][0].transcript);
        recognition.stop();
      };

      recognition.onerror = reject;
    });
  }

  say(text: string) {
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}
