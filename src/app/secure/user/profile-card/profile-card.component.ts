import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileCardComponent implements OnInit {
  _user!: string;
  _follow!: boolean;

  @ViewChild('followButton', { static: false })
  followButton!: ElementRef;
  constructor() { }

  ngOnInit(): void {
  }
  @Input()
  get userName(): string {
      return this._user;
  }
  set userName(value: string) {
      this._user = value;
  }
  @Input()
  get isFollower(): boolean {
      return this._follow;
  }
  set isFollower(value: boolean) {
      this._follow = value;
  }
  manageFollow() {
  }
}
