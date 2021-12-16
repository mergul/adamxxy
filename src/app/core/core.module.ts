import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LoaderService } from './loader.service';
import { NewsService } from './news.service';
import { ReactiveStreamsService } from './reactive-streams.service';
import { UserService } from './user.service';
import { WindowRef } from './window.service';

const routes: Routes = [
];
@NgModule({
  declarations: [FooterComponent, HeaderComponent],
  imports: [
    CommonModule, SharedModule, RouterModule.forChild(routes),
  ],
  providers: [ WindowRef, UserService, LoaderService, NewsService, ReactiveStreamsService
],
  exports: [FooterComponent, HeaderComponent, SharedModule]
})
export class CoreModule { }
