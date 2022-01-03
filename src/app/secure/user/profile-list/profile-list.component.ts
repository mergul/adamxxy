import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { MyUser } from '@core/user.model';
import { UserService } from '@core/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileListComponent implements OnInit {
  _users!: Array<string>;
  _me!: Observable<MyUser | null>;
  private _mtype!: number;
  constructor(public userService: UserService) {}

  ngOnInit(): void {}

  @Input() get mtype(): number {
    return this._mtype;
  }
  set mtype(value: number) {
    this._mtype = value;
    this.userService.viewStore.next(value===1?3:1);
  }
}
