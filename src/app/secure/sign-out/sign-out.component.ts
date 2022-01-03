import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@secure/auth.service';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignOutComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private cd: ChangeDetectorRef) {
     setTimeout(() => {
       this.cd.detectChanges();
     }, 0);
  }

  async ngOnInit() {
  }
  async close(value: boolean) {
    if (value) {
      await this.authService.signOut();
    }
    await this.router.navigate([history.state.url?history.state.url:'home']);
  }
}
