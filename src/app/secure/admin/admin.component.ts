import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '@secure/auth.service';
import { LazyLoadScriptService } from './lazy-load-script.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly destroy = new Subject<void>();
  constructor(
    private renderer: Renderer2,
    private scriptService: LazyLoadScriptService,
    @Inject(DOCUMENT) private _document: Document,
    private authService: AuthService
  ) {
    this.scriptService.renderer = this.renderer;
    this.scriptService.document = this._document;
    this.scriptService
      .loadScript(
        'https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css',
        'link'
      )
      .pipe(takeUntil(this.destroy))
      .subscribe((data) => {
        console.log(data);
      });
  }
  ngOnInit() {}
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
