import { Platform } from '@angular/cdk/platform';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { Subscription, filter } from 'rxjs';

import { AlainConfigService, AlainQRConfig } from '@delon/util/config';
import { InputNumber, NumberInput } from '@delon/util/decorator';
import { LazyService } from '@delon/util/other';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';

import { QR_DEFULAT_CONFIG } from './qr.config';
import { QROptions } from './qr.types';

/**
 * @deprecated Will be removed in 18.0.0, please use [nz-qrcode](https://ng.ant.design/components/qr-code) instead.
 */
@Component({
  selector: 'qr',
  exportAs: 'qr',
  template: `@if (dataURL) {
    <img style="max-width: 100%; max-height: 100%;" [src]="dataURL" />
  }`,
  host: {
    '[style.display]': `'inline-block'`,
    '[style.height.px]': 'size',
    '[style.width.px]': 'size'
  },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class QRComponent implements OnChanges, AfterViewInit, OnDestroy {
  static ngAcceptInputType_padding: NumberInput;
  static ngAcceptInputType_size: NumberInput;
  static ngAcceptInputType_delay: NumberInput;

  private lazy$?: Subscription;
  private qr: NzSafeAny;
  private cog: AlainQRConfig;
  private option!: QROptions;
  private inited = false;

  dataURL!: string;

  @Input() background?: string;
  @Input() backgroundAlpha?: number;
  @Input() foreground?: string;
  @Input() foregroundAlpha?: number;
  @Input() level?: string;
  @Input() mime?: string;
  @Input() @InputNumber(null) padding?: number;
  @Input() @InputNumber() size?: number;
  @Input() value: string | (() => string) = '';
  @Input() @InputNumber() delay?: number;
  @Output() readonly change = new EventEmitter<string>();

  constructor(
    private cdr: ChangeDetectorRef,
    configSrv: AlainConfigService,
    private lazySrv: LazyService,
    private platform: Platform
  ) {
    this.cog = configSrv.merge('qr', QR_DEFULAT_CONFIG)!;
    Object.assign(this, this.cog);
  }

  private init(): void {
    if (!this.inited) {
      return;
    }

    if (this.qr == null) {
      this.qr = new (window as NzSafeAny).QRious();
    }
    this.qr.set(this.option);
    this.dataURL = this.qr.toDataURL();
    this.change.emit(this.dataURL);
    this.cdr.detectChanges();
  }

  private initDelay(): void {
    this.inited = true;
    setTimeout(() => this.init(), this.delay);
  }

  ngAfterViewInit(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    if ((window as NzSafeAny).QRious) {
      this.initDelay();
      return;
    }
    const url = this.cog.lib!;
    this.lazy$ = this.lazySrv.change
      .pipe(filter(ls => ls.length === 1 && ls[0].path === url && ls[0].status === 'ok'))
      .subscribe(() => this.initDelay());
    this.lazySrv.load(url);
  }

  ngOnChanges(): void {
    const option: QROptions = {
      background: this.background,
      backgroundAlpha: this.backgroundAlpha,
      foreground: this.foreground,
      foregroundAlpha: this.foregroundAlpha,
      level: this.level as NzSafeAny,
      mime: this.mime,
      padding: this.padding,
      size: this.size,
      value: typeof this.value === 'function' ? this.value() : this.toUtf8ByteArray(this.value)
    };
    this.option = option;
    this.init();
  }

  private toUtf8ByteArray(str: string): string {
    str = encodeURI(str);
    const result: number[] = [];
    for (let i = 0; i < str.length; i++) {
      if (str.charAt(i) !== '%') {
        result.push(str.charCodeAt(i));
      } else {
        result.push(parseInt(str.substring(i + 1, 2), 16));
        i += 2;
      }
    }
    return result.map(v => String.fromCharCode(v)).join('');
  }

  ngOnDestroy(): void {
    if (this.lazy$) {
      this.lazy$.unsubscribe();
    }
  }
}
