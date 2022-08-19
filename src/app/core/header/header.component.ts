import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { UserService } from '../user.service';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy = new Subject<void>()
  name!: string;
  query !: any;
  _isLogged!: boolean;

  constructor(public userService: UserService, private router: Router, public ui: LoaderService) {
    // this.userService.authChangeEmitter.pipe(takeUntil(this.destroy)).subscribe(re => {
    //   this._isLogged = re.isIn;
    //   this.name = re.name;
    //   if (this.ui.isLoading.getValue()) { this.ui.hide(); }
    // });
    // const fgh = localStorage.getItem('username');
    // if (fgh) {
    //   this.name = JSON.parse(fgh);
    //   this._isLogged = true;
    // } else this._isLogged = false;
    this.name = JSON.parse(localStorage.getItem('username') || '""');
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  ngAfterViewInit(): void {
    if (this.query.matches) {
      const el = document.getElementById('nav-toggle');
      if (el) {
        // this.zone.runOutsideAngular(() => {       
        document.querySelectorAll('nav li a, nav li button').forEach(item => {
          item.addEventListener('click', () => {
            // this.zone.run(() => 
            el.click()
            // );
          });
        });
      // });
      }
    }
  }
  ngOnInit(): void {
    this.query = window.matchMedia("(max-width: 800px)");
  }
  signOut() {
    if (this.router.url.startsWith('/secure')){
      this._isLogged = false;
      this.name = '';
      this.userService.logoutEmitter.emit(false);
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/secure/signout'], {state: {url: this.router.url}});
    }
  }
}
