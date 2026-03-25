import {
    AfterContentChecked,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    Input, OnDestroy, QueryList,
    TemplateRef,
    ViewChild, ViewChildren
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ATemplateWithResizablesComponent} from '../../../templates/template-resize-observer-component.abstract';

@Component({
    selector: 'app-slider-mobile',
    templateUrl: './slider-mobile.component.html',
    styleUrl: './slider-mobile.component.scss',
    standalone: true,
    imports: [
        CommonModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderMobileComponent extends ATemplateWithResizablesComponent implements OnDestroy, AfterContentChecked {
    @ViewChild('fixedWindow', { static: false }) fixedWindow!: ElementRef<HTMLDivElement>;
    @ViewChild('slider', { static: false }) slider!: ElementRef<HTMLUListElement>;
    @ViewChildren('resizableRef', { read: ElementRef }) cardElements!: QueryList<ElementRef>;
    @ContentChild('dataContent') dataContent!: TemplateRef<any>;
    @Input() list!: any[];

    private _cardPadding: number = 40;
    private _max_translate: number = 0;
    private _slide_width: number = 0;
    private _current_index: number = 0;
    private _total_slides: number = 0;
    private _percentage_to_threshold: number = 0.3;

    constructor(
        private _cdr: ChangeDetectorRef
    ) {
        super();
    }

    private _hasInitialized = false;

    ngAfterContentChecked() {
        if (!this._hasInitialized && this.cardElements?.length > 0) {
            this._hasInitialized = true;

            this.pipeTakeUntil(this.resizeObservable()).subscribe(() => {
                this._updateMeasures();
            });
        }
    }

    private _updateMeasures() {
        this._setMaxTranslate();
        this._setSingleSlideWidth();
        this._cdr.markForCheck();
    }

    private _setMaxTranslate() {
        if (!this.fixedWindow || !this.slider) {
            return;
        }

        const fixedWindowWidth = this.fixedWindow.nativeElement.offsetWidth;
        const wrapperWidth = this.slider.nativeElement.scrollWidth;
        this._max_translate = Math.max(0, wrapperWidth - fixedWindowWidth);
    }

    private _setSingleSlideWidth() {
        const firstCardElement = this.cardElements.first?.nativeElement as HTMLElement;

        if (firstCardElement) {
            this._slide_width = firstCardElement.offsetWidth + this._cardPadding;
        }

        this._total_slides = this.list.length;
    }

    private _startX: number = 0;
    private _on_drag_translate: number = 0;
    private _before_drag_translate: number = 0;
    private _is_dragging: boolean = false;

    public onTouchStart(evt: TouchEvent | MouseEvent) {
        this._startX = this.getClientX(evt);
        this._is_dragging = true;
    }

    public onTouchMove(evt: TouchEvent | MouseEvent) {
        if (!this._is_dragging) {
            return;
        }

        const tentativeTranslate = this._startX + (this._before_drag_translate - this.getClientX(evt));
        this._on_drag_translate = Math.min(Math.max(tentativeTranslate, 0), this._max_translate);

        this._setTranslateX(this._on_drag_translate);
    }

    public onTouchEnd() {
        if (!this._is_dragging) {
            return;
        }

        this._is_dragging = false;

        const swipeDistance = this._before_drag_translate - this._on_drag_translate;
        const swipeThreshold = this._slide_width * this._percentage_to_threshold;

        if (swipeDistance > swipeThreshold) {
            this._current_index--;
        } else if (swipeDistance < -swipeThreshold) {
            this._current_index++;
        }
        this._current_index = Math.max(0, Math.min(this._current_index, this._total_slides - 1));

        this._on_drag_translate = 0;
        this._before_drag_translate = this._getTargetTranslate();
        this._setTranslateX(this._before_drag_translate);
    }

    private getClientX(event: TouchEvent | MouseEvent): number {
        if (event instanceof TouchEvent) {
            return event.touches[0]?.clientX || 0;
        } else if (event instanceof MouseEvent) {
            return event.clientX;
        }
        return 0;
    }

    goToSlide(index: number) {
        this._current_index = Math.max(0, Math.min(index, this._total_slides - 1));
        this._on_drag_translate = 0;
        this._before_drag_translate = this._getTargetTranslate();
        this._setTranslateX(this._before_drag_translate);
    }

    private _getTargetTranslate(): number {
        const fixedWindowWidth = this.fixedWindow.nativeElement.offsetWidth;
        const slideCenterOffset = (fixedWindowWidth - this._slide_width) / 2;
        const targetTranslate = this._current_index * this._slide_width - slideCenterOffset;
        return Math.min(Math.max(targetTranslate, 0), this._max_translate);
    }

    private _setTranslateX(value: number) {
        if (this.slider) {
            this.slider.nativeElement.style.transform = `translateX(-${ value }px)`;
        }
    }
}
