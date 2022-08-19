import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { getApp } from '@angular/fire/app';
import { provideAuth, initializeAuth, indexedDBLocalPersistence, browserPopupRedirectResolver, Auth } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import 'zone.js/dist/zone';

const routes: Routes = [
  {
    path: '',
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'sign',
    loadChildren: () => import('./sign/sign.module').then((m) => m.SignModule),
  },
  {
    path: 'signout',
    loadChildren: () =>
      import('./sign-out/sign-out.module').then((m) => m.SignOutModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./user-management/user-management.module').then(
        (m) => m.UserManagementModule
      ),
  },
  {
    path: 'upload', loadChildren: () =>
      import('./multi-files-upload/multi-files-upload.module').then(m => m.MultiFilesUploadModule)
  },
  {
    path: 'admin', loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule)
  },
];

@NgModule({
  declarations: [ ],
  imports: [
    CommonModule, RouterModule.forChild(routes),
    provideAuth(() => {
      const auth = initializeAuth(getApp(), {
        persistence: indexedDBLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
      // if (environment.useEmulators) {
      //   connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      // }
      return auth;
    })
  ],
  providers: [AuthService],
  exports: [RouterModule]
})
export class SecureModule { }
