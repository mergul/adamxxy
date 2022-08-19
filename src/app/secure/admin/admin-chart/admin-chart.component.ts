import { DOCUMENT},from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { mergeMap, Subject, takeUntil},from 'rxjs';
import { LazyLoadScriptService},from '../lazy-load-script.service';
declare const TradingView: any;
declare const Datafeeds: any;

@Component({
  selector: 'app-admin-chart',
  templateUrl: './admin-chart.component.html',
  styleUrls: ['./admin-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminChartComponent implements OnInit {
  widget: any;
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
      .loadScript('assets/js/charting_library.standalone.js', 'script')
      .pipe(
        mergeMap((nhg) => {
          return this.scriptService.loadScript('assets/js/bundle.js', 'script');
        }),
        takeUntil(this.destroy)
      )
      .subscribe((data) => {
        setTimeout(() => {
          const canvas = this._document.getElementById('tv_chart_container');
          if (canvas) {
            this.widget = new TradingView.widget({
              // debug: true, // uncomment this line to see Library errors and warnings in the console
              fullscreen: true,
              symbol: 'AAPL',
              interval: '1D',
              container: 'tv_chart_container',

              //	BEWARE: no trailing slash is expected in feed URL
              datafeed: new Datafeeds.UDFCompatibleDatafeed(
                'https://demo-feed-data.tradingview.com'
              ),
              library_path: 'charting_library/',
              locale: this.getParameterByName('lang') || 'en',

              disabled_features: ['use_localstorage_for_settings'],
              enabled_features: ['study_templates'],
              charts_storage_url: 'https://saveload.tradingview.com',
              charts_storage_api_version: '1.1',
              client_id: 'tradingview.com',
              user_id: 'public_user_id',
              theme: this.getParameterByName('theme'),
            });
          }
        }, 100);
      });
  }
  ngOnInit(): void {}
  getParameterByName(name: string) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      results = regex.exec(location.search);
    return results === null
      ? ''
      : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
}
