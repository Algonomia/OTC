import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChild, ElementRef, Input, QueryList, TemplateRef, ViewChildren,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenSizeHandlerComponent} from '../screen-size-handler/screen-size-handler.component';
import {SliderMobileComponent} from './slider-mobile/slider-mobile.component';
import {ATemplateComponent} from '../../templates/template-component.abstract';

@Component({
    selector: 'app-slider',
    templateUrl: './slider.component.html',
    styleUrl: './slider.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ScreenSizeHandlerComponent,
        SliderMobileComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent extends ATemplateComponent implements AfterViewInit {
    @ViewChildren('item', { read: ElementRef }) itemElements!: QueryList<ElementRef>;
    @ContentChild('contentTemplate') contentTemplate!: TemplateRef<any>;

    @Input() set list(list: unknown[]) {
        this._list = list;
    }

    get list() {
        return this._list;
    }

    private _list: unknown[] = [];
    public max_height: number = 0;

    constructor(private _cdr: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        this.itemElements.changes.subscribe(() => {
            this._updateMaxHeight();
        });
    }

    private _updateMaxHeight() {
        if (this.itemElements.length > 0) {
            const firstCard = this.itemElements.first;

            if (firstCard) {
                const newHeight = firstCard.nativeElement.offsetHeight;

                if (this.max_height !== newHeight) {
                    this.max_height = newHeight;
                    this._cdr.markForCheck();
                }
            }
        }
    }
}
