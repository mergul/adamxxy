import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, first, Observable } from 'rxjs';

export interface AppWindow extends Window {
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
    SpeechRecognition: any;
}

const { webkitSpeechRecognition, mozSpeechRecognition, SpeechRecognition, msSpeechRecognition }: AppWindow = (window as any) as AppWindow;

export interface RecognitionResult {
    transcript?: string;
    info?: string;
    confidence?: number;
    error?: SpeechError;
}

export enum SpeechError {
    NO_SPEECH,
    NO_MICROPHONE,
    NOT_ALLOWED,
    BLOCKED
}

@Injectable({ providedIn: 'root' })
export class SpeechService {
  _supportRecognition!: boolean;
  _speech: typeof SpeechRecognition;
  private firstSpeechStore = new BehaviorSubject<RecognitionResult>({
    transcript: '',
  });
  private segSpeechStore = new BehaviorSubject<RecognitionResult>({
    transcript: '',
  });
  private speechSubject!: BehaviorSubject<RecognitionResult>;
  firstSpeechState = this.firstSpeechStore.asObservable();
  segSpeechState = this.segSpeechStore.asObservable();
  isFirst!: boolean;
  ignoreOnEnd!: boolean;
  startTimestamp: any;
  utterance!: SpeechSynthesisUtterance;
  private _mitext = '';
  finalTranscript: string | undefined;

  constructor(protected http: HttpClient) {}
  public init(): void {
    this._supportRecognition = true;
    if ('SpeechRecognition' in window) {
      this._speech = new SpeechRecognition();
    } else if ('webkitSpeechRecognition' in window) {
      this._speech = new webkitSpeechRecognition();
    } else if ('msSpeechRecognition' in window) {
      this._speech = new msSpeechRecognition();
    } else if ('mozSpeechRecognition' in window) {
      this._speech = new mozSpeechRecognition();
    } else {
      this._supportRecognition = false;
    }
    this.utterance = new SpeechSynthesisUtterance();
    this.speechSubject = this.firstSpeechStore;
    console.log(`Speech supported: ${this._supportRecognition}`);
  }
  startSpeech(timestamp: any, isFirst: boolean) {
    this.startTimestamp = timestamp;
    this.isFirst = isFirst;
    this.speechSubject = isFirst ? this.firstSpeechStore : this.segSpeechStore;
    this.finalTranscript = this.speechSubject.value?.transcript;
    this._speech.start();
  }
  setLanguage(language: string) {
    this._speech.lang = language;
  }
  initializeSettings(language: string): void {
    this._speech.continuous = true;
    this._speech.interimResults = true;
    this._speech.lang = language;
    this.initListeners();
  }
  public set mitext(text: string) {
    this._mitext = text;
  }
  private initListeners() {
    this._speech.onstart = (ev: Event) => {
      this.speechSubject.next({ transcript: 'speak now!' });
    };
    this._speech.onend = (ev: Event) => {
      if (this.ignoreOnEnd) {
        return;
      }
      if (this._mitext !== '') {
        this.speechSubject.next({
          transcript: this._mitext,
          info: 'print',
        });
      }
      this.speechSubject.next({ transcript: this.finalTranscript });
    };
    this._speech.onerror = (event: any) => {
      let result!: SpeechError;
      if (event.error === 'no-speech') {
        result = SpeechError.NO_SPEECH;
        this.ignoreOnEnd = true;
      }
      if (event.error === 'audio-capture') {
        result = SpeechError.NO_MICROPHONE;
        this.ignoreOnEnd = true;
      }
      if (event.error === 'not-allowed') {
        if (event.timeStamp - this.startTimestamp < 100) {
          result = SpeechError.BLOCKED;
        } else {
          result = SpeechError.NOT_ALLOWED;
        }
        this.ignoreOnEnd = true;
      }
      this.speechSubject.next({ error: result });
    };
    this._speech.onresult = (event: any) => {
      let _interimTranscript = '';
      let _finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          _finalTranscript += ' ' + event.results[i][0].transcript;
          this.finalTranscript += _finalTranscript;
          // console.log('final transcript', event, this.finalTranscript);
        } else {
          _interimTranscript += event.results[i][0].transcript;
          // console.log('interim transcript', event, _interimTranscript);
        }
      }
      if (_finalTranscript)
        this.speechSubject.next({
          info: 'final_transcript',
          transcript: this.finalTranscript,
        });
      if (_interimTranscript)
        this.speechSubject.next({
          info: 'interim_transcript',
          transcript: _interimTranscript,
        });
    };
  }
  stop() {
    this._speech?.stop();
  }
  // getMessage(isFirst: boolean): Observable<RecognitionResult> {
  //   return isFirst
  //     ? this.firstSpeechStore.asObservable()
  //     : this.segSpeechStore.asObservable();
  // }
  translate = (options: any): Observable<string> => {
    const miurl =
      'https://script.google.com/macros/s/AKfycbweT9Vi_HhKzrLB8yMx29oFQlsPHHPYcJ68LMojN_elqlO_QUrT/exec';
    let params = new HttpParams();
    params = params.append('q', options.q);
    params = params.append('target', options.target);
    params = params.append('source', options.source);
    params = params.append('callback', '?');
    return this.http.get<string>(miurl, { params });
  };
  say = (options: any) => {
    this.utterance.lang = options.lang;
    this.utterance.text = options.text;

    window.speechSynthesis.speak(this.utterance);
  };
  resetState() {
    this.firstSpeechStore.next({ transcript: '' });
    this.segSpeechStore.next({ transcript: '' });
  }
}
