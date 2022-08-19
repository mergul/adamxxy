import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { NewsPayload } from '@core/news.model';
import { Point } from '@core/Point';
import { WindowRef } from '@core/window.service';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListComponent implements OnInit, OnDestroy {
  private postsBehaviorSubject = new BehaviorSubject<NewsPayload[]>([]);
  postsList$ = this.postsBehaviorSubject.asObservable();
  private _postsList!: Observable<NewsPayload[]>;
  private _percentage: number = 0;
  private unsubscriber$: Subject<boolean> = new Subject<boolean>();
  destroy = new Subject<void>();
  destroy$ = this.destroy.asObservable();
  query!: any;
  length!: number;
  _orderBy = 'count';

  myFrag!: HTMLElement | null;
  isUp = false;
  currentPage = 0;
  prevOffset = 0;
  private _size!: number;
  private _name!: string;

  constructor(
    private router: Router,
    private winRef: WindowRef
  ) {}
  ngOnInit() {
    this.query = window.matchMedia('(max-width: 800px)');
  }
  onNav(
    ev: MouseEvent,
    name: string,
    index: number,
    forward: boolean,
    size: number
  ): void {
    let msize = size;
    let mindex;
    this.length = this.postsBehaviorSubject.getValue().length;
    if (this.query.matches) {
      msize = size === 3 ? 2 : 3;
    }
    // console.log("msize--> " + msize + " -index--> " + index + " -pageX --> " + ev.pageX);
    if (forward) {
      if (ev.pageX < window.innerWidth * (msize / (msize + 1))) {
        this.go();
      }
      mindex = index + msize > this.length ? this.length : index + msize;
    } else {
      if (ev.pageX > window.innerWidth * (1 / (msize + 1))) {
        this.go();
      }
      mindex = index - msize < 1 ? 1 : index - msize;
    }
    const el = document.getElementById(name + mindex);
    if (el) {
      const me = el.parentElement as HTMLElement;
      if (!!!this.winRef.nativeWindow.chrome && name.startsWith('i'))
        me.style.overflowX = 'hidden';
      el.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
      if (!!!this.winRef.nativeWindow.chrome && name.startsWith('i'))
        setTimeout(() => {
          me.style.overflowX = 'scroll';
        }, 750);
    }
  }
  go() {
    this.router.navigate(['details']);
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.unsubscriber$.unsubscribe();
  }
  @Input()
  get size(): number {
    return this._size;
  }
  set size(value: number) {
    this._size = value;
  }
  @Input()
  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }
  set percentage(value: number) {
    this.isUp = value > this._percentage;
    this._percentage = value;
    if (
      this.isUp &&
      !this.unsubscriber$.closed &&
      this.postsBehaviorSubject.getValue().length > 9
    ) {
      this.currentPage++;
      this.getStories();
    }
  }
  @Input()
  get postsList(): Observable<NewsPayload[]> {
    return this.postsList$;
  }
  set postsList(value: Observable<NewsPayload[]>) {
    if (value) {
      this._postsList = value;
      this.currentPage = 1;
      this.getStories();
    }
  }
  getStories = () => {
    this._postsList
      .pipe(
        takeUntil(this.destroy$),
        map((x) => {
          if (x.length > 10 && !this.unsubscriber$.closed) {
            if (this.currentPage > 1 && x.length < this.currentPage * 10) {
              this.unsubscriber$.next(true);
              this.unsubscriber$.unsubscribe();
              this.currentPage = 1;
              this.postsBehaviorSubject.next(x);
              //  console.log('stopped to listen --> ' + this.prevOffset);
            } else {
              this.postsBehaviorSubject.next(x.slice(0, 10 * this.currentPage));
            }
          } else if (x.length > 0) {
            this.postsBehaviorSubject.next(x);
          }
          return this.postsList$;
        })
      )
      .subscribe();
  };
  byId(index: number, item: NewsPayload) {
    if (!item) {
      return '0';
    }
    return item.newsId;
  }
  track(event: Point) {
    setTimeout(() => {
      this.percentage = Math.round(event.x);
    }, 750);
  }
}
