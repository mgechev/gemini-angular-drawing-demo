# Gemini Angular Drawing Demo

This repository contains a demo similar to the [drawing video](https://youtube.com/clip/UgkxANEdAgfAiAz9TSgwY_2MSdmHg-MQkXL6?si=tqNbYfFmLwccRv5x) Google showed during the release of Gemini, using Web APIs.

## How to use?

First, make sure you [generate an API key](https://makersuite.google.com/app/apikey) and use it in `generative.service.ts`.

After that:

```
$ git clone git@github.com:mgechev/angular-gemini-drawing-demo
$ cd angular-gemini-drawing-demo
$ npm i
$ ng serve
```

Open Chrome and navigate to http://localhost:4200.

The demo uses the `webkitSpeechRecognition` API, which currently has limited [browser support](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API).

## Technical details

This demo uses:

- Angular and the Gemini JavaScript API
- Web Speech API (`SpeechRecognition` and `SpeechSynthesis`)
- HTML5 canvas API

# License

MIT
