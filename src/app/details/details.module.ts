import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

const routes: Routes = [
  { path: '', component: DetailsComponent},
];

@NgModule({
  declarations: [
    DetailsComponent
  ],
  imports: [
    CommonModule, SharedModule, RouterModule.forChild(routes)
  ],
  providers: []
})
export class DetailsModule { }
