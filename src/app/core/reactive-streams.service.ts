import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Observable, BehaviorSubject } from 'rxjs';
import { NewsPayload } from './news.model';
import { RecordSSE } from './record.sse';
import { BalanceRecord } from './user.model';

@Injectable({ providedIn: 'root' })
export class ReactiveStreamsService {
  private renderer!: Renderer2;
  private newsEventSource!: EventSourcePolyfill;
  private newsBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
  private tagsBehaviorSubject = new BehaviorSubject<RecordSSE[]>([]);
  private countsBehaviorSubject = new BehaviorSubject<RecordSSE[]>([]);
  private publicBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
  nlinks = [
    'En Çok Okunanlar',
    'Takip Edilen Etiketler',
    'Takip Edilen Kişiler',
  ];
  private ntagBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
  private npeopleBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
  private meBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
  private balanceBehaviorSubject = new BehaviorSubject<BalanceRecord[]>([]);
  publicUsersStreamList$: Map<string, NewsPayload[]> = new Map<
    string,
    NewsPayload[]
  >();
  private hotUsersBehaviorSubject = new BehaviorSubject<BalanceRecord[]>([]);
  random: number = 0;
  isSubscribed = true;
  index: number = 0;
  topList: Map<string, Array<string>> = new Map<string, Array<string>>();
  mexListener!: (ev: any, ism: any, iso: any) => void;
  hexListener!: (ev: any, ism: any, iso: any) => void;
  myxListener!: (ev: any, ism: any, iso: any) => void;
  meListener: any;
  heListener: any;
  myListener: any;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }
  getNewsStream(processName: number, url: string) {
    //  let headers: HttpHeaders = new HttpHeaders();
    // headers = headers
    //   .append('accept', 'text/event-stream')
    //   .append('X-Custom-Header', 'last-event-id');
    const headers = {
      accept: 'text/event-stream',
      'X-Custom-Header': 'last-event-id',
    };
    //   this.zone.runOutsideAngular(() => {
    this.newsEventSource = new EventSourcePolyfill(url, {
      headers: headers,
      withCredentials: true,
      heartbeatTimeout: 60000,
    });
    this.renderer.listen(
      this.newsEventSource,
      'top-news-' + processName,
      (event: MessageEvent) => {
        //   if (event instanceof MessageEvent) {
        const topNews = JSON.parse(event.data);
        const list = this.newsBehaviorSubject.getValue();
        //   this.zone.run(() => {
        if (!this.isSubscribed) {
          list.splice(this.index, topNews.list.length, ...topNews.list);
          this.newsBehaviorSubject.next([...list]);
          this.index += topNews.list.length;
        } else {
          this.newsBehaviorSubject.next([...list, ...topNews.list]);
        }
        // });
      }
    );
    this.renderer.listen(
      this.newsEventSource,
      'top-news',
      (event: MessageEvent) => {
        const topNews = JSON.parse(event.data);
        const list = this.newsBehaviorSubject.getValue();
        // this.zone.run(() =>
        this.newsBehaviorSubject.next([...list, ...topNews.list]);
        // );
      }
    );
    this.renderer.listen(
      this.newsEventSource,
      'top-tags',
      (event: MessageEvent) => {
        const topTags = JSON.parse(event.data);
        this.tagsBehaviorSubject.next(topTags.list);
      }
    );
    this.renderer.listen(
      this.newsEventSource,
      'user-counts',
      (event: MessageEvent) => {
        const userCounts = JSON.parse(event.data);
        // this.zone.run(() =>
        this.countsBehaviorSubject.next(userCounts);
        // );
      }
    );
    this.newsEventSource.addEventListener('close', (event: any) => {
      this.closeSources();
    });
    this.newsEventSource.onerror = (
      err: any //this.zone.run(() =>
    ) => {
      if (this.newsEventSource.readyState === 0) {
        this.isSubscribed = false;
        this.index = 0;
        this.unsubscribeResource();
      } else {
        this.newsBehaviorSubject.error('EventSource error:::' + err.statusText);
        this.tagsBehaviorSubject.error('EventSource error:::' + err.statusText);
        this.countsBehaviorSubject.error(
          'EventSource error:::' + err.statusText
        );
      }
    };
    //  );
    this.mexListener = (ev, ism, iso) => this.listenIt(ev, ism, iso);
    this.meListener = this.mexListener.bind(this, true, false);
    this.hexListener = (ev, ism, iso) => this.listenIt(ev, ism, iso);
    this.heListener = this.hexListener.bind(this, false, true);
    this.myxListener = (ev, ism, iso) => this.listenIt(ev, ism, iso);
    this.myListener = this.myxListener.bind(this, false, false);
    // });
  }
  getNewsSubject(id: string): BehaviorSubject<NewsPayload[]> {
    switch (id) {
      case 'main':
        return this.newsBehaviorSubject;
      case 'tags':
        return this.ntagBehaviorSubject;
      case 'people':
        return this.npeopleBehaviorSubject;
      case 'me':
        return this.meBehaviorSubject;
      case 'other':
        return this.publicBehaviorSubject;
      default:
        return this.newsBehaviorSubject;
    }
  }
  getBalanceSubject(id: string) {
    switch (id) {
      case 'hotRecords':
        return this.hotUsersBehaviorSubject;
      case 'user-history':
        return this.balanceBehaviorSubject;
      default:
        return this.hotUsersBehaviorSubject;
    }
  }
  getMessage(sub: string): Observable<any> {
    switch (sub) {
      case this.nlinks[0]:
        return this.newsBehaviorSubject.asObservable();
      case 'top-tags':
        return this.tagsBehaviorSubject.asObservable();
      case 'user-counts':
        return this.countsBehaviorSubject.asObservable();
      case 'other-person':
        return this.publicBehaviorSubject.asObservable();
      case this.nlinks[1]:
        return this.ntagBehaviorSubject.asObservable();
      case this.nlinks[2]:
        return this.npeopleBehaviorSubject.asObservable();
      case 'me':
        return this.meBehaviorSubject.asObservable();
      case 'user-history':
        return this.balanceBehaviorSubject.asObservable();
      case 'hotRecords':
        return this.hotUsersBehaviorSubject.asObservable();
      default:
        return this.newsBehaviorSubject.asObservable();
    }
  }
  setListeners(id: string) {
    this.setFirstListeners(id);
    // this.zone.runOutsideAngular(() => {
    this.renderer.listen(
      this.newsEventSource,
      'top-news-' + id,
      this.meListener
    );
    this.renderer.listen(
      this.newsEventSource,
      'user-counts-' + id,
      (event: MessageEvent) => {
        const userCounts = JSON.parse(event.data);
        // this.zone.run(() =>
        this.countsBehaviorSubject.next(userCounts);
        // );
      }
    );
    this.renderer.listen(
      this.newsEventSource,
      'user-history-' + id,
      (event: MessageEvent) => {
        const balances = JSON.parse(event.data);
        const list = this.balanceBehaviorSubject.getValue();
        if (list.length > 0) {
          list.push(balances);
        } else list.push(...balances);
        // this.zone.run(() =>
        this.balanceBehaviorSubject.next(list);
        // );
      }
    );
    this.renderer.listen(
      this.newsEventSource,
      'hotRecords-' + id,
      (event: MessageEvent) => {
        const balances = JSON.parse(event.data);
        const list = this.hotUsersBehaviorSubject.getValue();
        if (list.length > 0) {
          let index = -1;
          list.some(function (elem, i) {
            return elem.key === balances.key && ~(index = i);
          });
          if (index !== -1) list.splice(index, 1, balances);
        } else list.push(...balances);
        // this.zone.run(() =>
        this.hotUsersBehaviorSubject.next(list);
        // );
      }
    );
    // });
  }
  setFirstListeners(id: string) {
    const myB = this.topList.get('top-news-' + id);
    if (myB) {
      if (myB.includes('other')) {
        this.resetOtherListListeners(id);
        this.topList.set(
          'top-news-' + id,
          myB.filter((fer) => fer !== 'other')
        );
      } else if (myB.includes('follow')) {
        this.resetUserListListeners(id);
        this.topList.set(
          'top-news-' + id,
          myB.filter((fer) => fer !== 'follow')
        );
      }
    }
    if (!this.topList.has('top-news-' + id)) {
      this.topList.set('top-news-' + id, ['me']);
      // this.zone.runOutsideAngular(() => {
      this.renderer.listen(
        this.newsEventSource,
        'top-news-' + id + '-' + this.random,
        this.meListener
      );
      this.renderer.listen(
        this.newsEventSource,
        'top-news-people-' + id + '-' + this.random,
        this.myListener
      );
      this.renderer.listen(
        this.newsEventSource,
        'top-news-tags-' + id + '-' + this.random,
        this.myListener
      );
      // });
    } else if (this.publicUsersStreamList$.has(id.substring(1))) {
      const myB = this.publicUsersStreamList$.get(id.substring(1));
      if (myB)
        //    this.zone.run(() =>
        this.meBehaviorSubject.next(myB);
      //    );
    }
  }
  addToSubjectSingle = (subj: BehaviorSubject<NewsPayload[]>, event: any) => {
    const topNews = JSON.parse(event.data);
    const list = subj.getValue();
    // this.zone.run(() =>
    subj.next([...list, ...topNews.list]);
    // );
  };
  listenIt = (isMe: boolean, isOther: boolean, event: any) => {
    if (isMe) {
      this.addToSubjectSingle(this.getNewsSubject('me'), event);
      this.publicUsersStreamList$.set(
        event.type.split('-')[2].substring(1),
        this.meBehaviorSubject.getValue()
      );
    } else if (isOther) {
      this.addToSubjectSingle(this.getNewsSubject('other'), event);
      this.publicUsersStreamList$.set(
        event.type.split('-')[2].substring(1),
        this.publicBehaviorSubject.getValue()
      );
    } else if (event.lastEventId === 'people' || event.lastEventId === 'tags') {
      this.addToSubjectSingle(this.getNewsSubject(event.lastEventId), event);
    } else if (event.lastEventId === 'me') {
      this.addToSubject(this.getNewsSubject('people'), event);
      console.log('people --> ' + JSON.stringify(event));
    } else if (event.lastEventId === 'tag') {
      this.addToSubject(this.getNewsSubject('tags'), event);
    }
  };
  addToSubject = (subj: BehaviorSubject<NewsPayload[]>, event: any) => {
    const topNews = JSON.parse(event.data);
    // this.zone.run(() => {
    const array2: string[] = [];
    const array3: NewsPayload[] = [];
    subj.getValue().map((xx) => {
      array2.push(xx.newsId);
      array3.push(xx);
    });
    topNews.list.forEach((df: NewsPayload) => {
      if (!array2.includes(df.newsId)) {
        array3.push(df);
      }
    });
    subj.next(array3);
    if (event.lastEventId === 'me') {
      this.publicUsersStreamList$.set(
        event.type.split('-')[2].substring(1),
        topNews.list
      );
    }
    // });
  };
  resetUserListListeners(id: string, isMe = false) {
    this.newsEventSource.removeEventListener(
      'top-news-' + id,
      this.myListener,
      true
    );
    this.newsEventSource.removeEventListener(
      'top-news-' + id + '-' + this.random,
      this.myListener,
      true
    );
    if (id.charAt(0) === '@') {
      const pj = this.npeopleBehaviorSubject
        .getValue()
        .filter((nh) => nh.newsOwnerId !== id.substring(1));
      this.npeopleBehaviorSubject.next(pj);
      const myB = this.topList.get('top-news-' + id);
      if (isMe) {
        this.meBehaviorSubject.next([]);
        if (myB)
          this.topList.set(
            'top-news-' + id,
            myB.filter((fer) => fer !== 'me')
          );
      }
      if (myB)
        this.topList.set(
          'top-news-' + id,
          myB.filter((fer) => fer !== 'follow')
        );
    } else {
      const tj = this.ntagBehaviorSubject
        .getValue()
        .filter((nh) => !nh.tags.includes(id));
      this.ntagBehaviorSubject.next(tj);
    }
  }
  setUserListListeners(id: string) {
    if (id.charAt(0) === '@') {
      const myB = this.topList.get('top-news-' + id);
      if (myB) myB.push('follow');
      else this.topList.set('top-news-' + id, ['follow']);
    }
    // this.zone.runOutsideAngular(() => {
    this.renderer.listen(
      this.newsEventSource,
      'top-news-' + id + '-' + this.random,
      this.myListener
    );
    this.renderer.listen(
      this.newsEventSource,
      'top-news-' + id,
      this.myListener
    );
    // });
  }
  resetOtherListListeners(id: string, isMe = false) {
    this.newsEventSource.removeEventListener(
      'top-news-' + id,
      this.heListener,
      true
    );
    this.newsEventSource.removeEventListener(
      'top-news-' + id + '-' + this.random,
      this.heListener,
      true
    );
    const myB = this.topList.get('top-news-' + id);
    if (isMe) {
      this.newsEventSource.removeEventListener(
        'top-news-' + id,
        this.meListener,
        true
      );
      this.newsEventSource.removeEventListener(
        'top-news-' + id + '-' + this.random,
        this.meListener,
        true
      );
      this.meBehaviorSubject.next([]);
      if (myB)
        this.topList.set(
          'top-news-' + id,
          myB.filter((fer) => fer !== 'me')
        );
    } else {
      this.publicBehaviorSubject.next([]);
      if (myB)
        this.topList.set(
          'top-news-' + id,
          myB.filter((fer) => fer !== 'other')
        );
    }
  }
  resetNavListListeners(id: string) {
    this.resetOtherListListeners(id, true);
    this.newsEventSource.removeEventListener(
      'top-news-tags-' + id + '-' + this.random,
      this.myListener,
      true
    );
    this.newsEventSource.removeEventListener(
      'top-news-people-' + id + '-' + this.random,
      this.myListener,
      true
    );
    this.npeopleBehaviorSubject.next([]);
    this.ntagBehaviorSubject.next([]);
    this.unsubscribeResource();
  }
  setOtherListener(id: string) {
    if (!this.topList.has('top-news-' + id)) {
      this.topList.set('top-news-' + id, ['other']);
      // this.zone.runOutsideAngular(() => {
      this.renderer.listen(
        this.newsEventSource,
        'top-news-' + id + '-' + this.random,
        this.heListener
      );
      this.renderer.listen(
        this.newsEventSource,
        'top-news-' + id,
        this.heListener
      );
      this.renderer.listen(
        this.newsEventSource,
        'user-counts-' + id,
        (event: MessageEvent) => {
          const userCounts = JSON.parse(event.data);
          // this.zone.run(() =>
          this.countsBehaviorSubject.next(userCounts);
          // );
        }
      );
      // });
    } else if (this.publicUsersStreamList$.has(id.substring(1))) {
      const myB = this.publicUsersStreamList$.get(id.substring(1));
      if (myB) this.publicBehaviorSubject.next(myB);
    } else
      this.publicBehaviorSubject.next(
        this.npeopleBehaviorSubject
          .getValue()
          .filter((val) => val.newsOwnerId === id.substring(1))
      );
  }
  statusOfNewsSource = () => {
    return this.newsEventSource;
  };
  closeSources() {
    this.unsubscribeResource();
    this.newsEventSource.close();
  }
  unsubscribeResource() {
    console.log('unsubscribeResource --> ' + this.random);
    fetch('/sse/unsubscribe', {
      keepalive: true,
      method: 'PATCH',
      body: 'TopNews' + this.random,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
