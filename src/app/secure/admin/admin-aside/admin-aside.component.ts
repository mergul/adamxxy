import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LazyLoadScriptService } from '../lazy-load-script.service';
declare const Chart: any;

@Component({
  selector: 'app-admin-aside',
  templateUrl: './admin-aside.component.html',
  styleUrls: ['./admin-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAsideComponent implements OnInit {
  labels = ['January', 'February', 'March', 'April', 'May', 'June'];
  data = {
    labels: this.labels,
    datasets: [
      {
        label: 'My First dataset',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0, 10, 5, 2, 20, 30, 45],
      },
    ],
  };
  config = {
    type: 'line',
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
