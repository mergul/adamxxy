import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NewsService } from '../core/news.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  list = ['','','','','','','','','','','','','','','','','','','','','','','',''];
  length = this.list.length;
  percentage= 0;
  constructor(public newsService: NewsService, private changeDetector: ChangeDetectorRef) {
  }
  
  ngOnInit() {
  }
  ngOnDestroy() {
  }
  track(event:any){
    const ut=Math.round(event.y);
    if (this.percentage<ut) {
      this.percentage=ut;
      this.changeDetector.detectChanges();
    }
  }
}
