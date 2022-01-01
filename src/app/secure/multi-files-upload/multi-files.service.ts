import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NewsFeed } from '@core/news.model';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MultiFilesService {
  private _url: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private _thumbs: Map<string, Blob> = new Map<string, Blob>();
  private _totalFiles: Array<File> = [];
  newsFeedStore: BehaviorSubject<NewsFeed | null> =
    new BehaviorSubject<NewsFeed | null>(null);
  uploadStore: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  feedState = this.newsFeedStore.asObservable();
  uploadAction = this.feedState.pipe(
    switchMap((newsFeed) =>
      this.httpClient.post<boolean>('/api/rest/news/save', newsFeed, {responseType: 'json',})
    )
  );

  constructor(private httpClient: HttpClient ){}

  get thumbs(): Map<string, Blob> {
    return this._thumbs;
  }

  set thumbs(value: Map<string, Blob>) {
    this._thumbs = value;
  }

  get totalFiles(): Array<File> {
    return this._totalFiles;
  }

  set totalFiles(value: Array<File>) {
    this._totalFiles = value;
  }

  getUrls(): Observable<Array<string>> {
    return this._url.asObservable();
  }

  setUrls(value: Array<string>) {
    this._url.next(value);
  }
  remove(index: number) {
    this.totalFiles.splice(index, 1);
    const key = Array.from(this.thumbs.keys())[index];
    this.thumbs.delete(key);
    const jj = this._url.value;
    jj.splice(index, 1);
    this._url.next(jj);
  }
  // getSignedUrl(name: string): Observable<string> {
  //     return this.httpClient.get<string>('/api/rest/storage/' + name, {
  //         responseType: 'json'
  //     });
  // }
  // postNews(newsFeed: NewsFeed): Observable<boolean> {
  //   return this.httpClient.post<boolean>('/api/rest/news/save', newsFeed, {
  //     responseType: 'json',
  //   });
  // }
}
