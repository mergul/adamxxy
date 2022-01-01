import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiFilesUploadComponent } from './multi-files-upload.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilesThumbnailsComponent } from './files-thumbnails/files-thumbnails.component';
import { SharedModule } from 'app/shared/shared.module';
import { SpeechService } from './speech-service';
import { MultiFilesService } from './multi-files.service';

const routes: Routes = [
  { path: '', component: MultiFilesUploadComponent},
];

@NgModule({
  declarations: [MultiFilesUploadComponent, FilesThumbnailsComponent],
  imports: [
    CommonModule, SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [SpeechService, MultiFilesService],
})
export class MultiFilesUploadModule {}
