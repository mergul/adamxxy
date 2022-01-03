import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NewsPayload } from '@core/news.model';
import { NewsService } from '@core/news.service';
import { UserService } from '@core/user.service';

@Component({
  selector: 'app-user-contents',
  templateUrl: './user-contents.component.html',
  styleUrls: ['./user-contents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserContentsComponent implements OnInit {
  constructor(public newsService: NewsService, public userService: UserService) {
     this.userService.viewStore.next(0);
  }

  ngOnInit(): void {
  }
  byId(index: number, item: NewsPayload) {
    if (!item) {
      return '0';
    }
    return item.newsId;
  }
}
