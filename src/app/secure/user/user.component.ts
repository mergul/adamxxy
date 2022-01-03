import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NewsService } from '@core/news.service';
import { UserService } from '@core/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit, OnDestroy {
  
  constructor(public newsService: NewsService, public userService: UserService, private cd: ChangeDetectorRef) {
    this.userService._meState.subscribe((state) => {
      setTimeout(() => {
        this.cd.detectChanges();
      }, 0);
    });
  }
  
  ngOnDestroy(): void {
    window.scrollTo(0, 0);
  }
  ngOnInit(): void {
  }
}
