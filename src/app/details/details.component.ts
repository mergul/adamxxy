import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, Subject } from 'rxjs';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent implements OnInit, OnDestroy {
  private readonly destroy = new Subject<void>();
  viewMode = 'tab1';
  _videoStringUrl = 'https://dl8.webmfiles.org/big-buck-bunny_trailer.webm';
  _videoUrl!: Observable<any>;
  constructor(
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef,
  ) {
    requestAnimationFrame(() => {
      if (!this._videoUrl) {
        this._videoUrl = of(this.sanitizer.bypassSecurityTrustUrl(
          this._videoStringUrl
        ));
        document.body.style.overflowY = 'hidden';
        this.changeDetector.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    if (!this._videoUrl) {
      this._videoUrl = of(this.sanitizer.bypassSecurityTrustUrl(
        this._videoStringUrl
      ));
      document.body.style.overflowY = 'hidden';
    }
  }
  ngOnDestroy(): void {
    document.body.style.overflowY = 'auto';
    this.destroy.next();
    this.destroy.complete();
  }
  onClick(viewMode: 'tab1' | 'tab2' | 'tab3') {
    this.viewMode = viewMode;
    this.changeDetector.detectChanges();
  }
}
