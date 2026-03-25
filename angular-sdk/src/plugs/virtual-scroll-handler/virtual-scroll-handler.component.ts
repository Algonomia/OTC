import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef,
    Input, QueryList,
    TemplateRef, ViewChild, ViewChildren
} from '@angular/core';
import {debounceTime, ReplaySubject} from 'rxjs';
import { ScrollerModule, Scroller } from 'primeng/scroller';
import {NgTemplateOutlet} from '@angular/common';
import {ATemplateWithResizablesComponent} from '../../templates/template-resize-observer-component.abstract';

@Component({
  selector: 'app-virtual-scroll-handler',
  imports: [ScrollerModule, NgTemplateOutlet],
  templateUrl: './virtual-scroll-handler.component.html',
  styleUrl: './virtual-scroll-handler.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualScrollHandlerComponent extends ATemplateWithResizablesComponent implements AfterViewInit {
    @ViewChildren('scrollElement', { read: ElementRef }) scrollElements!: QueryList<ElementRef>;
    @ViewChild('virtualScroller') _virtualScroller!: Scroller;
    @Input() menuLineTemplate!: TemplateRef<{idx?: number, line_value: unknown}>;
    @Input() maxHeight = '280px';
    @Input() set lineHeightPx(value: number) {
        this.__lineHeightPx = value;
        this.__bufferHeightPx = 10 * value;
        this._updateHeight.next();
    }
    @Input() set line_values(values: unknown[] | Set<unknown>) {
        this.__line_values = Array.from(values);
        this._updateHeight.next();
    }

    private _updateHeight = new ReplaySubject<void>(1);
    __line_values: unknown[] = [];
    __lineHeightPx: number = 40;
    __bufferHeightPx: number = 400;
    __virtualScrollHeight = '0px';
    __containerHeight = '0px';
    __widthPx = 0;
    __width = '0px';

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        this.pipeTakeUntil(this._updateHeight).pipe(debounceTime(50)).subscribe((_) => {
            const height = (this.__line_values?.length || 0) * this.__lineHeightPx;
            this.__virtualScrollHeight = height + 'px';
            this.__containerHeight = `calc(min(${this.__virtualScrollHeight}, ${this.maxHeight}))`;
            this._cd.markForCheck();
        });

        this.pipeTakeUntil(this.resizeObservable()).pipe(debounceTime(50)).subscribe(entries => {
            if (!entries?.length) {
                return;
            }
            const widths = entries.map(entry => entry.contentRect.width);
            const maxWidth = Math.max(...widths);

            if (maxWidth > this.__widthPx) {
                this.__widthPx = maxWidth;
                this.__width = `${this.__widthPx}px`;
                this._cd.markForCheck();
            }
        });
    }
}
