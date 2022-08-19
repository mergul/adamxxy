import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LoaderService } from '@core/loader.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private ui: LoaderService) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (localStorage.getItem('is') === '1') {
      this.ui.show();
      return this.authService.emitRedirectResult().then(result => {
        if (result != null && result.user != null) {
          const returnUrl = localStorage.getItem('returnUrl');
          localStorage.setItem('is', '0');
          this.router.navigate([returnUrl ? returnUrl : 'secure/user']);
        } else this.ui.hide();
        return true;
      });
    } else {
      return this.authService.isLoggedIn.pipe(map(isLoggedIn => {
        if (isLoggedIn.isIn) {
          const returnUrl = this.router.url;
          this.router.navigate([returnUrl ? returnUrl : 'secure/user']);
        }
        return true;
      }))
    }
  }
}
