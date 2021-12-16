import { Directive, EventEmitter, Output, ElementRef } from "@angular/core";
import { fromEvent, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { Point } from '@core/Point';
import { WindowRef } from '@core/window.service';

@Directive({
  selector: '[appScroll]',
})
export class ScrollDirective {
  @Output() onScroll = new EventEmitter<Point>();
  pointValue: Point = { x: 0, y: 0 };
  destroy = new Subject<void>();
  destroy$ = this.destroy.asObservable();

  constructor(
    private element: ElementRef<HTMLElement>,
    private winRef: WindowRef
  ) {
    let scrollElement: HTMLElement = this.element.nativeElement;
    let matime = 150;
    if (this.element.nativeElement.tagName === 'MAIN') {
      scrollElement = this.winRef.nativeWindow;
      matime = 15;
    }
    this.scrollObs(scrollElement, matime)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const px = scrollElement.scrollLeft || this.winRef.nativeWindow.scrollX;
        const py = scrollElement.scrollTop || this.winRef.nativeWindow.scrollY;
        if (this.pointValue.x < px || this.pointValue.y < py) {
          this.pointValue = { x: px, y: py };
          this.onScroll.emit(this.pointValue);
        }
      });
  }

  scrollObs = (elem: HTMLElement, matime: number) =>
    // this.zone.runOutsideAngular(() =>
    fromEvent(elem, 'scroll', {
      passive: true,
    }).pipe(
      //tap(() => this.isScroll = true),
      debounceTime(matime),
      distinctUntilChanged()
    );
  //);

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}