import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, map, takeUntil } from 'rxjs';
import { UserService } from '../user.service';
import { LoaderService } from '../loader.service';
import { ReactiveStreamsService } from '@core/reactive-streams.service';
import { WindowRef } from '@core/window.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy = new Subject<void>();
  name!: string;
  query!: any;
  _isLogged!: boolean;
  loggedUserId!: string | null;
  private _baseUrl = '/api/rest/user/';

  constructor(
    public userService: UserService,
    private reactiveService: ReactiveStreamsService,
    private router: Router,
    public ui: LoaderService,
    private renderer: Renderer2,
    private winRef: WindowRef
  ) {
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
    this.loggedUserId = localStorage.getItem('id');
    if (!!this.loggedUserId) {
      const url =
        this._baseUrl +
        this.loggedUserId +
        '/' +
        this.reactiveService.random +
        '/0';
      if (this.userService._meUrlStore.getValue() !== url) {
        this.userService._meUrlStore.next(url);
      }
    }
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
        document.querySelectorAll('nav li a, nav li button').forEach((item) => {
          item.addEventListener('click', () => {
            // this.zone.run(() =>
            el.click();
            // );
          });
        });
        // });
      }
    }
    this.renderer.listen(this.winRef.nativeWindow, 'load', () => {
      let itbe = this.userService.authChangeEmitter.observers.length;
      if (
        this.userService._meStore.getValue() === null &&
        !!this.userService._meUrlStore.value &&
        itbe === 1
      ) {
        console.log('into the headers auth object');
        this.userService._meBackend
          .pipe(
            takeUntil(this.destroy),
            map((user) => {
              if (user) {
                this.reactiveService.setListeners('@' + this.loggedUserId);
                this.userService.newsCo.set(
                  this.userService.links[1],
                  user.tags.map((value) => {
                    this.reactiveService.setUserListListeners('#' + value);
                    return '#' + value;
                  })
                );
                this.userService.newsCo.set(
                  this.userService.links[2],
                  user.users.map((value) => {
                    this.reactiveService.setUserListListeners('@' + value);
                    return '@' + value;
                  })
                );
              }
              this.userService._meStore.next(user);
              return true;
            })
          )
          .subscribe();
      }
    });
  }
  ngOnInit(): void {
    this.query = window.matchMedia('(max-width: 800px)');
  }
  signOut() {
    if (this.router.url.startsWith('/secure')) {
      this._isLogged = false;
      this.name = '';
      this.userService.logoutEmitter.emit(false);
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/secure/signout'], {
        state: { url: this.router.url },
      });
    }
  }
}
