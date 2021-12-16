import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsListComponent } from './posts-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ScrollDirective } from './scroll.directive';

const routes: Routes = [];

@NgModule({
  declarations: [
    PostsListComponent, ScrollDirective
  ],
  imports: [
    CommonModule, SharedModule, RouterModule.forChild(routes),
  ],
  exports: [PostsListComponent, SharedModule, ScrollDirective],
})
export class PostsListModule { }
