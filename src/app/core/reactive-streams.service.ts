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
  private followedTagsSubject = new BehaviorSubject<NewsPayload[]>([]);
  private followedPeopleSubject = new BehaviorSubject<NewsPayload[]>([]);
  private meBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);

  nlinks = [
    'En Çok Okunanlar',
    'Takip Edilen Etiketler',
    'Takip Edilen Kişiler',
  ];
  private balanceBehaviorSubject = new BehaviorSubject<BalanceRecord[]>([]);
  publicUsersStreamList$: Map<string, NewsPayload[]> = new Map<
    string,
    NewsPayload[]
  >();
  private hotUsersBehaviorSubject = new BehaviorSubject<BalanceRecord[]>([]);
  random: number = 0;
  isSubscribed = true;
  index: number = 0;
  mainlistenerFn = () => {};
  mainlistenerStartFn = () => {};
  mainTaglistenerFn = () => {};
  mainCountlistenerFn = () => {};
  meLıstenerStartFn = () => {};
  myPeoplelistenerFn = () => {};
  myTagslistenerFn = () => {};
  topList: Map<string, Array<string>> = new Map<string, Array<string>>();
  mainxListener!: (ev: any, ism: any, iso: any) => void;
  mainTagxListener!: (ev: any, ism: any, iso: any) => void;
  mainCouxListener!: (ev: any, ism: any, iso: any) => void;

  mexListener!: (ev: any, ism: any, iso: any, ist: any, isp: any) => void;
  otherxListener!: (ev: any, ism: any, iso: any, ist: any, isp: any) => void;
  myTagxListener!: (ev: any, ism: any, iso: any, ist: any, isp: any) => void;
  myPeoplexListener!: (ev: any, ism: any, iso: any, ist: any, isp: any) => void;
  minexListener!: (ev: any, ism: any, iso: any, ist: any, isp: any) => void;

  mainListener: any;
  mainTagListener: any;
  mainCouListener: any;
  meListener: any;
  mineListener: any;
  othersListener: any;
  myTagsListener: any;
  myPeopleListener: any;

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
    this.newsEventSource = new EventSourcePolyfill(url, {
      headers: headers,
      withCredentials: true,
      heartbeatTimeout: 60000,
    });
    this.mainxListener = (ev, ism, iso) => this.listenMain(ev, ism, iso);
    this.mainListener = this.mainxListener.bind(this, true, false);
    this.mainTagxListener = (ev, ism, iso) => this.listenMain(ev, ism, iso);
    this.mainTagListener = this.mainTagxListener.bind(this, false, true);
    this.mainCouxListener = (ev, ism, iso) => this.listenMain(ev, ism, iso);
    this.mainCouListener = this.mainCouxListener.bind(this, false, false);

    this.mexListener = (ev, ism, iso, ist, isp) =>
      this.listenIt(ev, ism, iso, ist, isp);
    this.meListener = this.mexListener.bind(this, true, false, false, false);
    this.otherxListener = (ev, ism, iso, ist, isp) =>
      this.listenIt(ev, ism, iso, ist, isp);
    this.othersListener = this.otherxListener.bind(
      this,
      false,
      true,
      false,
      false
    );
    this.myPeoplexListener = (ev, ism, iso, ist, isp) =>
      this.listenIt(ev, ism, iso, ist, isp);
    this.myPeopleListener = this.myPeoplexListener.bind(
      this,
      false,
      false,
      false,
      true
    );
    this.myTagxListener = (ev, ism, iso, ist, isp) =>
      this.listenIt(ev, ism, iso, ist, isp);
    this.myTagsListener = this.myTagxListener.bind(
      this,
      false,
      false,
      true,
      false
    );
    this.minexListener = (ev, ism, iso, ist, isp) =>
      this.listenIt(ev, ism, iso, ist, isp);
    this.mineListener = this.minexListener.bind(
      this,
      false,
      false,
      false,
      false
    );
    this.mainlistenerFn = this.renderer.listen(
      this.newsEventSource,
      'top-news',
      (event: MessageEvent) => {
        const topNews = JSON.parse(event.data);
        const list = this.newsBehaviorSubject.getValue();
        this.newsBehaviorSubject.next([...list, ...topNews.list]);
      }
    );
    this.mainlistenerStartFn = this.renderer.listen(
      this.newsEventSource,
      'top-news-' + processName,
      this.mainListener
    );
    this.mainTaglistenerFn = this.renderer.listen(
      this.newsEventSource,
      'top-tags',
      (event: MessageEvent) => {
        const topTags = JSON.parse(event.data);
        this.tagsBehaviorSubject.next(topTags.list);
      }
    );
    this.mainCountlistenerFn = this.renderer.listen(
      this.newsEventSource,
      'user-counts',
      (event: MessageEvent) => {
        const userCounts = JSON.parse(event.data);
        this.countsBehaviorSubject.next(userCounts);
      }
    );
    this.newsEventSource.addEventListener('close', (event: any) => {
      this.closeSources();
    });
    this.newsEventSource.onerror = (err: any) => {
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
    // const worker = new Worker(new URL('../app.worker', import.meta.url));
    // worker.onmessage = ({ data }) => {
    //   console.log(`page got message: ${data}`);
    // };
    // worker.postMessage([JSON.stringify(this.newsEventSource), processName]);
  }
  // getEventSource() {
  //   return this.newsEventSource;
  // }
  listenMain(isMe: any, isOther: any, event: any): void {
    if (isMe) {
      const topNews = JSON.parse(event.data);
      const list = this.newsBehaviorSubject.getValue();
      if (!this.isSubscribed) {
        list.splice(this.index, topNews.list.length, ...topNews.list);
        this.newsBehaviorSubject.next([...list]);
        this.index += topNews.list.length;
      } else {
        this.newsBehaviorSubject.next([...list, ...topNews.list]);
      }
    } else if (isOther) {
      const topTags = JSON.parse(event.data);
      this.tagsBehaviorSubject.next(topTags.list);
    } else {
      const userCounts = JSON.parse(event.data);
      this.countsBehaviorSubject.next(userCounts);
    }
  }
  resetMainListeners() {
    this.mainlistenerStartFn();
    this.mainlistenerFn();
    this.mainTaglistenerFn();
    this.mainCountlistenerFn();
  }
  getNewsSubject(id: string): BehaviorSubject<NewsPayload[]> {
    switch (id) {
      case 'main':
        return this.newsBehaviorSubject;
      case 'tags':
        return this.followedTagsSubject;
      case 'people':
        return this.followedPeopleSubject;
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
        return this.followedTagsSubject.asObservable();
      case this.nlinks[2]:
        return this.followedPeopleSubject.asObservable();
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
    this.newsEventSource.addEventListener(
      'top-news-' + id,
      this.meListener,
      true
    );
    this.renderer.listen(
      this.newsEventSource,
      'user-counts-' + id,
      (event: MessageEvent) => {
        const userCounts = JSON.parse(event.data);
        this.countsBehaviorSubject.next(userCounts);
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
        this.balanceBehaviorSubject.next(list);
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
        this.hotUsersBehaviorSubject.next(list);
      }
    );
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
    this.topList.set('top-news-' + id, ['me']);
    // if (!this.topList.has('top-news-' + id)) {
    this.meLıstenerStartFn = this.renderer.listen(
      this.newsEventSource,
      'top-news-' + id + '-' + this.random,
      this.meListener
    );
    this.myPeoplelistenerFn = this.renderer.listen(
      this.newsEventSource,
      'top-news-people-' + id + '-' + this.random,
      this.myPeopleListener
    );
    this.myTagslistenerFn = this.renderer.listen(
      this.newsEventSource,
      'top-news-tags-' + id + '-' + this.random,
      this.myTagsListener
    );
    // } else if (this.publicUsersStreamList$.has(id.substring(1))) {
    //   const myB = this.publicUsersStreamList$.get(id.substring(1));
    //   if (myB) this.meBehaviorSubject.next(myB);
    // }
  }
  addToSubjectSingle = (subj: BehaviorSubject<NewsPayload[]>, event: any) => {
    const topNews = JSON.parse(event.data);
    const list = subj.getValue();
    // this.zone.run(() =>
    subj.next([...list, ...topNews.list]);
    // );
  };
  listenIt = (
    isMe: boolean,
    isOther: boolean,
    isTags: boolean,
    isPeople: boolean,
    event: any
  ) => {
    if (isMe) {
      this.addToSubjectSingle(this.getNewsSubject('me'), event);
      console.log('listenIt isMe: ', event);
      this.meLıstenerStartFn();
    } else if (isOther) {
      this.addToSubject(this.getNewsSubject('other'), event);
      this.publicUsersStreamList$.set(
        event.type.split('-')[2].substring(1),
        this.publicBehaviorSubject.getValue()
      );
    } else if (isPeople) {
      this.addToSubject(this.getNewsSubject('people'), event);
      this.myPeoplelistenerFn();
    } else if (isTags) {
      this.addToSubject(this.getNewsSubject('tags'), event);
      this.myTagslistenerFn();
    } else if (event.lastEventId === 'person' || event.lastEventId === 'tag') {
      this.addToSubject(this.getNewsSubject('other'), event);
      this.publicUsersStreamList$.set(
        event.type.split('-')[2].substring(1),
        this.publicBehaviorSubject.getValue()
      );
      event.lastEventId === 'person'
        ? this.addToSubjectSingle(this.followedPeopleSubject, event)
        : this.addToSubjectSingle(this.followedTagsSubject, event);
    }
  };
  addToSubject = (subj: BehaviorSubject<NewsPayload[]>, event: any) => {
    const topNews = JSON.parse(event.data);
    const array2: string[] = [];
    const array3: NewsPayload[] = [];
    subj.getValue().map((xx) => {
      array2.push(xx.newsId);
      topNews.list.forEach((payload: NewsPayload) => {
        if (payload.newsId === xx.newsId) {
          array3.push(xx);
        }
      });
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
  };
  resetUserListListeners(id: string, isMe = false) {
    this.newsEventSource.removeEventListener(
      'top-news-' + id,
      this.mineListener,
      true
    );
    this.newsEventSource.removeEventListener(
      'top-news-' + id + '-' + this.random,
      this.mineListener,
      true
    );
    if (id.charAt(0) === '@') {
      const pj = this.followedPeopleSubject
        .getValue()
        .filter((nh) => nh.newsOwnerId !== id.substring(1));
      this.followedPeopleSubject.next(pj);
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
      const tj = this.followedTagsSubject
        .getValue()
        .filter((nh) => !nh.tags.includes(id));
      this.followedTagsSubject.next(tj);
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
      this.mineListener
    );
    this.renderer.listen(
      this.newsEventSource,
      'top-news-' + id,
      this.mineListener
    );
    // });
  }
  resetOtherListListeners(id: string, isMe = false) {
    this.newsEventSource.removeEventListener(
      'top-news-' + id,
      this.othersListener,
      true
    );
    this.newsEventSource.removeEventListener(
      'top-news-' + id + '-' + this.random,
      this.othersListener,
      true
    );
    const myB = this.topList.get('top-news-' + id);
    if (isMe) {
      this.newsEventSource.removeEventListener(
        'top-news-' + id,
        this.meListener,
        true
      );
      // this.newsEventSource.removeEventListener(
      //   'top-news-' + id + '-' + this.random,
      //   this.meListener,
      //   true
      // );
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
      this.myTagsListener,
      true
    );
    this.newsEventSource.removeEventListener(
      'top-news-people-' + id + '-' + this.random,
      this.myPeopleListener,
      true
    );
    this.followedPeopleSubject.next([]);
    this.followedTagsSubject.next([]);
    this.unsubscribeResource();
  }
  setOtherListener(id: string) {
    if (!this.topList.has('top-news-' + id)) {
      this.topList.set('top-news-' + id, ['other']);
      // this.zone.runOutsideAngular(() => {
      this.renderer.listen(
        this.newsEventSource,
        'top-news-' + id + '-' + this.random,
        this.othersListener
      );
      this.renderer.listen(
        this.newsEventSource,
        'top-news-' + id,
        this.othersListener
      );
      this.renderer.listen(
        this.newsEventSource,
        'user-counts-' + id,
        (event: MessageEvent) => {
          const userCounts = JSON.parse(event.data);
          this.countsBehaviorSubject.next(userCounts);
        }
      );
    } else if (this.publicUsersStreamList$.has(id.substring(1))) {
      const myB = this.publicUsersStreamList$.get(id.substring(1));
      if (myB) this.publicBehaviorSubject.next(myB);
    } else
      this.publicBehaviorSubject.next(
        this.followedPeopleSubject
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
    this.resetMainListeners();
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
