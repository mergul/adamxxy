import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NewsPayload } from '@core/news.model';
import { NewsService } from '@core/news.service';

@Component({
  selector: 'app-user-contents',
  templateUrl: './user-contents.component.html',
  styleUrls: ['./user-contents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserContentsComponent implements OnInit {
  // meList!: Observable<NewsPayload[]>;
  constructor(public newsService: NewsService) { 
  }

  ngOnInit(): void {
    // this.meList = this.newsService.meStreamList$;
  }
  byId(index: number, item: NewsPayload) {
    if (!item) {
      return '0';
    }
    return item.newsId;
  }
}
