import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { fromEvent, debounceTime, filter, takeUntil } from 'rxjs';

import type { Chart, Event } from '@antv/g2';

import { G2BaseComponent, G2InteractionType } from '@delon/chart/core';
import { BooleanInput, InputBoolean, InputNumber, NumberInput } from '@delon/util/decorator';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';

const TITLE_HEIGHT = 41;

export interface G2BarData {
  x: NzSafeAny;
  y: NzSafeAny;
  color?: string | null;
  [key: string]: NzSafeAny;
}

export interface G2BarClickItem {
  item: G2BarData;
  ev: Event;
}

@Component({
  selector: 'g2-bar',
  exportAs: 'g2Bar',
  template: `
    <ng-container *nzStringTemplateOutlet="title">
      <h4 style="margin-bottom: 20px;">{{ title }}</h4>
    </ng-container>
    @if (!loaded) {
      <nz-skeleton />
    }
    <div #container></div>
  `,
  host: {
    '[style.height.px]': 'height'
  },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class G2BarComponent extends G2BaseComponent {
  static ngAcceptInputType_height: NumberInput;
  static ngAcceptInputType_autoLabel: BooleanInput;

  // #region fields

  @Input() title?: string | TemplateRef<void>;
  @Input() color = 'rgba(24, 144, 255, 0.85)';
  @Input() @InputNumber() height = 0;
  @Input() padding: number | number[] | 'auto' = 'auto';
  @Input() data: G2BarData[] = [];
  @Input() @InputBoolean() autoLabel = true;
  @Input() interaction: G2InteractionType = 'none';
  @Output() readonly clickItem = new EventEmitter<G2BarClickItem>();

  // #endregion

  private getHeight(): number {
    return this.title ? this.height - TITLE_HEIGHT : this.height;
  }

  install(): void {
    const { node, padding, interaction, theme } = this;

    const container = node.nativeElement as HTMLElement;
    const chart: Chart = (this._chart = new this.winG2.Chart({
      container,
      autoFit: true,
      height: this.getHeight(),
      padding,
      theme
    }));
    this.updatelabel();
    chart.axis('y', {
      title: null,
      line: null,
      tickLine: null
    });
    chart.scale({
      x: {
        type: 'cat'
      },
      y: {
        min: 0
      }
    });
    chart.tooltip({
      showTitle: false
    });
    if (interaction !== 'none') {
      chart.interaction(interaction);
    }
    chart.legend(false);
    chart
      .interval()
      .position('x*y')
      .color('x*y', (x, y) => {
        const colorItem = this.data.find(w => w.x === x && w.y === y);
        return colorItem && colorItem.color ? colorItem.color : this.color;
      })
      .tooltip('x*y', (x, y) => ({ name: x, value: y }));

    chart.on(`interval:click`, (ev: Event) => {
      this.ngZone.run(() => this.clickItem.emit({ item: ev.data?.data, ev }));
    });

    this.ready.next(chart);

    this.changeData();
    chart.render();
    this.installResizeEvent();
  }

  changeData(): void {
    const { _chart, data } = this;
    if (!_chart || !Array.isArray(data) || data.length <= 0) return;

    _chart.changeData(data);
  }

  private updatelabel(): void {
    const { node, data, _chart } = this;
    const canvasWidth = node.nativeElement.clientWidth;
    const minWidth = data.length * 30;
    _chart.axis('x', canvasWidth > minWidth).render();
  }

  private installResizeEvent(): void {
    if (!this.autoLabel || this.resize$) return;

    this.resize$ = fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !!this._chart),
        debounceTime(200)
      )
      .subscribe(() => this.ngZone.runOutsideAngular(() => this.updatelabel()));
  }
}
