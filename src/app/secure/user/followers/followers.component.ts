import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '@core/news.service';
import { UserService } from '@core/user.service';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowersComponent implements OnInit {
  constructor(public userService: UserService, public newsService: NewsService, public route: ActivatedRoute) {
    this.userService.viewStore.next(2);
  }

  ngOnInit(): void {}
}
