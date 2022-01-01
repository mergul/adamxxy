import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { MultiFilesService } from '../multi-files.service';

@Component({
  selector: 'app-files-thumbnails',
  templateUrl: './files-thumbnails.component.html',
  styleUrls: ['./files-thumbnails.component.scss']
})
export class FilesThumbnailsComponent implements OnInit {
  private _thumbs!: Array<string>;
  constructor(public service: MultiFilesService, public sani: DomSanitizer) { }

  ngOnInit() {
  }
  @Input()
  get thumbs(): Array<string> {
    return this._thumbs;
  }

  set thumbs(value: Array<string>) {
    this._thumbs = value;
  }

  removeItem(i: number) {
    this.service.remove(i);
  }
}
