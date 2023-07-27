import {
  ApplicationRef,
  Injectable,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { Router } from '@angular/router';
import { traceUntilFirst } from '@angular/fire/performance';
import { Auth, authState, User } from '@angular/fire/auth';
import {
  EMPTY,
  forkJoin,
  from,
  Observable,
  of,
  ReplaySubject,
  Subject,
} from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { UserService } from '@core/user.service';
import { ReactiveStreamsService } from '@core/reactive-streams.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnInit, OnDestroy {
  private readonly destroy = new Subject<void>();
  public readonly user: Observable<User | null> = EMPTY;
  isMobile!: boolean;
  isRedirected = false;
  _baseUrl = '/api/rest/user/';

  constructor(
    @Optional() private auth: Auth,
    private router: Router,
    private userService: UserService,
    private reactiveService: ReactiveStreamsService,
    private ref: ApplicationRef
  ) {
    // this.afAuth.useEmulator("http://localhost:9099");
    this.isMobile = window.innerWidth < 600;
    const myUser = userService._meStore.getValue();
    if (myUser === null) {
      console.log('into the auth service auth object');
      if (auth) {
        this.user = authState(this.auth);
        authState(this.auth)
          .pipe(
            traceUntilFirst('auth'),
            switchMap((user) => {
              if (user) {
                this.userService.authChangeEmitter.next({
                  isIn: true,
                  name: user.displayName!,
                });
                localStorage.setItem(
                  'username',
                  JSON.stringify(user.displayName)
                );
                const id = this.userService.createId(user.uid);
                if (!this.reactiveService.topList.get('top-news-@' + id)) {
                  this.reactiveService.setListeners('@' + id);
                }
                const url =
                  this._baseUrl + id + '/' + this.reactiveService.random + '/0';
                if (this.userService._meUrlStore.getValue() !== url) {
                  this.userService._meUrlStore.next(url);
                  localStorage.setItem('id', id);
                }
                return forkJoin({ id: of(id), token: from(user.getIdToken()) });
              } else {
                this.userService.authChangeEmitter.next({
                  isIn: false,
                  name: '',
                });
                localStorage.setItem('username', '');
                localStorage.setItem('id', '');
                return forkJoin({ id: of(''), token: of('') });
              }
            }),
            switchMap(({ id, token }) => {
              if (id) {
                localStorage.setItem('token', token);
                return this.userService._meBackend.pipe();
                // return this.userService.getDbUser('/api/rest/user/' + id + '/' + this.reactiveService.random+ '/0');
              } else {
                return of(null);
              }
            }), //, shareReplay(1)
            takeUntil(this.destroy)
          )
          .subscribe((user) => {
            if (user) {
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
          });
      }
    } else {
      this.userService.authChangeEmitter.next({
        isIn: true,
        name: myUser.firstname!,
      });
    }
    this.userService.logoutEmitter
      .pipe(takeUntil(this.destroy))
      .subscribe(async (ss) => {
        await this.signOut();
      });
  }
  get isLoggedIn(): ReplaySubject<{ isIn: boolean; name: string }> {
    return this.userService.authChangeEmitter;
  }

  async loginToGoogle() {
    const asd = await import('./GoogleAuthProvider');
    const provider = new asd.GoogleAuthProvider(); // GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    if (this.isMobile) {
      localStorage.setItem('is', '1');
      await asd.signInWithRedirect(this.auth, provider);
    } else {
      localStorage.setItem('is', '0');
      await asd.signInWithPopup(this.auth, provider);
    }
  }

  async resetPassword(email: string) {
    const asd = await import('./FirebaseActions');
    return await asd
      .sendPasswordResetEmail(this.auth, email, {
        url: 'http://localhost:4200/auth', // Here we redirect back to this same page.
        handleCodeInApp: true, // This must be true.
      })
      .then(() => console.log('Sent Password Reset Email!'))
      .catch((error: any) => Promise.reject(error));
  }
  async confirmPasswordReset(actionCode: string, newPassword: string) {
    const asd = await import('./FirebaseActions');
    return await asd.confirmPasswordReset(this.auth, actionCode, newPassword);
  }
  async verifyPasswordResetCode(actionCode: string) {
    const asd = await import('./FirebaseActions');
    return await asd.verifyPasswordResetCode(this.auth, actionCode);
  }

  async signUp(email: string, password: string) {
    const asd = await import('./FirebaseActions');

    return await asd
      .createUserWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        asd
          .sendEmailVerification(result.user, {
            url: 'http://localhost:4200/auth', // Here we redirect back to this same page.
            handleCodeInApp: true, // This must be true.
          })
          .then(() => {
            setTimeout(() => {
              this.router.navigate(['secure/user']);
            }, 0);
          });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  // Sign in with email/password
  async signIn(email: string, password: string): Promise<void | Error> {
    const asd = await import('./FirebaseActions');
    return await asd
      .signInWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        this.router.navigate(['secure/user']);
      })
      .catch((error) => {
        window.alert(error.message);
        return Promise.reject(error);
      });
  }
  async signOut() {
    localStorage.removeItem('is');
    localStorage.removeItem('username');
    localStorage.removeItem('returnUrl');
    localStorage.removeItem('id');
    const user = this.userService._meStore.getValue();
    if (user) {
      this.reactiveService.resetNavListListeners('@' + user.id);
      for (const tag of user!.tags) {
        this.reactiveService.resetUserListListeners('#' + tag);
      }
      for (const tag of user!.users) {
        this.reactiveService.resetUserListListeners('@' + tag, true);
      }
    }
    const asd = await import('./FirebaseActions');
    return await asd.signOut(this.auth);
  }
  async emitRedirectResult() {
    const asd = await import('./GoogleAuthProvider');
    return await asd.getRedirectResult(this.auth);
  }
  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
