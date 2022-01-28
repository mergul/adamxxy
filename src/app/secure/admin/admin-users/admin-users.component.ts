import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LazyLoadScriptService } from '../lazy-load-script.service';
declare const Chart: any;

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit {
  data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)',
        ],
        borderWidth: 1,
      },
    ],
  };
  config = {
    type: 'bar',
    data: this.data,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
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
