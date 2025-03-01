import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Host,
  Input,
  OnChanges,
  Optional,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';

import { ResponsiveService } from '@delon/theme';
import { InputNumber, NumberInput } from '@delon/util/decorator';

import { SGContainerComponent } from './sg-container.component';

const prefixCls = `sg`;

@Component({
  selector: 'sg',
  exportAs: 'sg',
  template: ` <ng-content /> `,
  host: {
    '[style.padding-left.px]': 'paddingValue',
    '[style.padding-right.px]': 'paddingValue'
  },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SGComponent implements OnChanges, AfterViewInit {
  static ngAcceptInputType_col: NumberInput;

  private el: HTMLElement;
  private clsMap: string[] = [];
  private inited = false;

  @Input() @InputNumber(null) col: number | null = null;

  get paddingValue(): number {
    return this.parent.gutter / 2;
  }

  constructor(
    el: ElementRef,
    private ren: Renderer2,
    @Optional() @Host() private parent: SGContainerComponent,
    private rep: ResponsiveService
  ) {
    if (parent == null) {
      throw new Error(`[sg] must include 'sg-container' component`);
    }
    this.el = el.nativeElement;
  }

  private setClass(): this {
    const { el, ren, clsMap, col, parent } = this;
    clsMap.forEach(cls => ren.removeClass(el, cls));
    clsMap.length = 0;
    const parentCol = parent.colInCon || parent.col;
    clsMap.push(...this.rep.genCls(col != null ? col : parentCol, parentCol), `${prefixCls}__item`);
    clsMap.forEach(cls => ren.addClass(el, cls));
    return this;
  }

  ngOnChanges(): void {
    if (this.inited) this.setClass();
  }

  ngAfterViewInit(): void {
    this.setClass();
    this.inited = true;
  }
}
