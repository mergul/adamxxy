import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LazyLoadScriptService } from '../lazy-load-script.service';

declare const Chart: any;
@Component({
  selector: 'app-admin-main',
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMainComponent implements OnInit, OnDestroy {
  data = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [300, 50, 100],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
        ],
        hoverOffset: 4,
      },
    ],
  };
  config = {
    type: 'pie',
    data: this.data,
  };
  myChart: any;
  ctx: any;
  private readonly destroy = new Subject<void>();
  @ViewChild('myCanvas') canvasRef!: ElementRef;

  constructor(
    private scriptService: LazyLoadScriptService,
    @Inject(DOCUMENT) private _document: Document,
    private renderer: Renderer2
  ) {
    this.scriptService.renderer = this.renderer;
    this.scriptService.document = this._document;
    this.scriptService
      .loadScript('https://cdn.jsdelivr.net/npm/chart.js', 'script')
      .pipe(takeUntil(this.destroy))
      .subscribe((data) => {
        setTimeout(() => {
          const canvas =
            this._document.getElementById('myChart') ||
            this.canvasRef.nativeElement;
          if (canvas) {
            this.ctx = canvas.getContext('2d');
            this.myChart = new Chart(this.ctx, this.config);
          }
        }, 100);
      });
  }
  ngOnDestroy(): void {
    if (this.myChart) this.myChart.destroy();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {}
}
