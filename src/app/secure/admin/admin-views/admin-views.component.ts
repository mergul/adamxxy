import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LazyLoadScriptService } from '../lazy-load-script.service';
declare const Chart: any;

@Component({
  selector: 'app-admin-views',
  templateUrl: './admin-views.component.html',
  styleUrls: ['./admin-views.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminViewsComponent implements OnInit {
  data = {
    labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [11, 16, 7, 3, 14],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(201, 203, 207)',
          'rgb(54, 162, 235)',
        ],
      },
    ],
  };
  config = {
    type: 'polarArea',
    data: this.data,
    options: {},
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
