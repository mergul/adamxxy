import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';
import { RouterModule, Routes } from '@angular/router';
import { UserContentsComponent } from './user-contents/user-contents.component';
import { FollowersComponent } from './followers/followers.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { AuthGuard } from '@secure/auth.guard';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { DetailsComponent } from 'app/details/details.component';
import { ProfileListComponent } from './profile-list/profile-list.component';
import { SharedModule } from 'app/shared/shared.module';

const routes: Routes = [
  { path: '', component: UserComponent, canActivate: [AuthGuard],
        children: 
          [
            { path: '', redirectTo: 'contents', pathMatch: 'full'},
            { path: 'user-edit', component: UserEditComponent},
            { path: 'contents', component: UserContentsComponent, children: [
              { path: ':id', component: DetailsComponent}
            ]},
            { path: 'followers', component: FollowersComponent, data: {link: 0}}, 
            { path: 'followee', component: FollowersComponent, data: {link: 1}},          
            { path: 'followco', component: FollowersComponent, data: {link: 2}},
          ]
  }];

@NgModule({
  declarations: [
    UserComponent, UserContentsComponent, FollowersComponent, UserEditComponent, ProfileCardComponent, ProfileListComponent,
  ],
  imports: [
    CommonModule, SharedModule, RouterModule.forChild(routes)
  ],
  providers: [AuthGuard]
})
export class UserModule { }
