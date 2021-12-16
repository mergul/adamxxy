import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { PostsListModule } from '../posts-list/posts-list.module';
import { DetailsComponent } from '../details/details.component';

const routes: Routes = [
  { path: '', component: HomeComponent, children: [
    { path: ':id', component: DetailsComponent },
  ] }
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule, RouterModule.forChild(routes), PostsListModule
  ],
  providers: [ ],
  exports: [RouterModule, PostsListModule],
})
export class HomeModule {
 }
