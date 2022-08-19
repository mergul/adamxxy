import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UserService } from '@core/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEditComponent implements OnInit {

  constructor(private userService: UserService) { 
    this.userService.viewStore.next(4);
  }

  ngOnInit(): void {
  }

}
