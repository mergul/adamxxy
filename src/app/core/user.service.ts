import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { BalanceRecord, MyUser } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  newsCo: Map<string, Array<string>> = new Map<string, Array<string>>();
  logoutEmitter = new EventEmitter<boolean>();
  authChangeEmitter = new ReplaySubject<{ isIn: boolean; name: string }>(1);
  _otherUser!: Observable<MyUser | null>;
  _meStore: BehaviorSubject<MyUser | null> = new BehaviorSubject<MyUser | null>(
    null
  );
  _meState = this._meStore.asObservable();
  _meUrlStore = new BehaviorSubject<string>('');
  _meUrlState = this._meUrlStore.asObservable();
  _meBackend = this._meUrlState.pipe(
    switchMap((url) => {
      console.log('_meBackend', url);
      return this.http.get<MyUser>(url, {
        responseType: 'json',
        withCredentials: true,
      });
    }),
    shareReplay(1)
  );
  _hotBalance!: Observable<BalanceRecord[]>;
  _historyBalance!: Observable<BalanceRecord[]>;
  links = [
    'En Çok Okunanlar',
    'Takip Edilen Etiketler',
    'Takip Edilen Kişiler',
  ];
  viewStore: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  viewState: Observable<number> = this.viewStore.asObservable();

  constructor(private http: HttpClient) {}

  getDbUser(url: string): Observable<MyUser> {
    return this.http
      .get<MyUser>(url, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(shareReplay(1));
  }
  createId(loggedId: string) {
    return Array.from(loggedId.substring(0, 12))
      .map((c) =>
        c.charCodeAt(0) < 128
          ? c.charCodeAt(0).toString(16)
          : encodeURIComponent(c).replace(/\%/g, '').toLowerCase()
      )
      .join('');
  }
}
