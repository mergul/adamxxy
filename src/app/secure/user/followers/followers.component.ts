import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@core/user.service';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowersComponent implements OnInit {
  link!: number;
  users!: Array<string>;
  tags!: Array<string>;
  constructor(public userService: UserService, public route: ActivatedRoute) {}

  ngOnInit(): void {}
}
