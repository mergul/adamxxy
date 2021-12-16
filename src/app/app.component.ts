import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { LoaderService } from '@core/loader.service';
import { NewsService } from '@core/news.service';
import { ReactiveStreamsService } from '@core/reactive-streams.service';
import { WindowRef } from '@core/window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy = new Subject<void>();
  private newslistUrl: string;
  isChildRoutePath = false;
  isNeighbor = false;

  constructor(
    private reactiveService: ReactiveStreamsService,
    public ui: LoaderService,
    private router: Router,
    public newsService: NewsService,
    private winRef: WindowRef,
    private changeDetector: ChangeDetectorRef
  ) {
    if (!this.reactiveService.random) {
      this.reactiveService.random =
        Math.floor(Math.random() * (999999 - 100000)) + 100000;
    }
    this.newslistUrl =
      '/sse/chat/room/TopNews' +
      this.reactiveService.random +
      '/subscribeMessages';
    this.router.events
      .pipe(
        takeUntil(this.destroy),
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((event: any) => {
          const ll = event.urlAfterRedirects.split('/').slice(1);
          const l = Math.min(
            ll.length - 1,
            this.newsService.getBreadcrumbList().length - 1
          );
          this.isChildRoutePath =
            this.newsService.getBreadcrumbList()[l] == ll[l];
          this.isNeighbor =
            l > 0 && this.newsService.getBreadcrumbList()[l - 1] == ll[l - 1];
          this.newsService.setBreadcrumbList(
            event.urlAfterRedirects.split('/').slice(1)
          );
          this.changeDetector.detectChanges();
        })
      )
      .subscribe(() => {
        if (!this.isChildRoutePath) {
          if (this.isNeighbor) {
            if (this.winRef.nativeWindow.scrollY > 300) {
              window.scrollTo(0, 300);
            }
          } else {
            window.scrollTo(0, 0);
          }
        }
      });
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  ngAfterViewInit(): void {
    // this.zone.run(() => {
    this.winRef.nativeWindow.onload = () => {
      if (!this.reactiveService.statusOfNewsSource()) {
        this.reactiveService.getNewsStream(
          this.reactiveService.random,
          this.newslistUrl
        );
      }
      if (!this.newsService.newsStreamList$) {
        this.newsService.newsStreamList$ = this.reactiveService.getMessage(
          this.newsService.links[0]
        );
        this.newsService.tagsStreamList$ = this.reactiveService.getMessage(
          this.newsService.links[1]
        );
        this.newsService.peopleStreamList$ = this.reactiveService.getMessage(
          this.newsService.links[2]
        );
        if (!this.newsService.meStreamList$)
          this.newsService.meStreamList$ =
            this.reactiveService.getMessage('me');
        this.newsService.newsStreamCounts$ = this.reactiveService
          .getMessage('user-counts')
          .pipe(
            map((record) => {
              if (record.key) {
                this.newsService.newsCounts$.set(
                  record.key,
                  String(record.value)
                );
              }
              return record;
            })
          );
      }
      this.newsService.topTags = this.reactiveService
        .getMessage('top-tags')
        .pipe(
          map((value) =>
            value.filter(
              (value1: { key: string }) => value1.key.charAt(0) === '#'
            )
          )
        );
    };
    //  });
  }
}
// this.ui.isLoading.pipe(takeUntil(this.destroy), map(value => {
//    this.zone.run(() => {
//     const el = this.winRef.nativeWindow.document.getElementById('spinner');
//     el.style.display = value ? 'block' : 'none';
//     value ? el.nextSibling.classList.add('blurred') : el.nextSibling.classList.remove('blurred');
//    })
// })).subscribe();
