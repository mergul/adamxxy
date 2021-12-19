import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NewsService } from '@core/news.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit, OnDestroy {
  viewMode = true;
  private readonly destroy = new Subject<void>();
  paths: string[] = [];
  constructor(
    private newsService: NewsService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ), takeUntil(this.destroy)
      )
      .subscribe(() => {
        this.paths = this.newsService.getBreadcrumbList();
        this.viewMode = false;
        this.changeDetector.detectChanges();
      });
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    window.scrollTo(0, 0);
  }
  ngOnInit(): void {
    this.paths = this.newsService.getBreadcrumbList();
  }
}
