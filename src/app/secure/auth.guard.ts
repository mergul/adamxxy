import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoaderService } from '@core/loader.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private ui: LoaderService) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(!this.ui.isLoading.getValue()) this.ui.show();
      const img= new Image();
      img.src = 'assets/back-img.jpeg';
      fromEvent(img, 'load').subscribe(() => console.log('img loaded'));
      return this.authService.isLoggedIn.pipe(map(isLoggedIn => {
      if (!isLoggedIn.isIn) {
        localStorage.setItem('returnUrl', state.url);
        this.router.navigate(['secure/sign']);
      }
      this.ui.hide();
      return true;
    }));
  }
}
