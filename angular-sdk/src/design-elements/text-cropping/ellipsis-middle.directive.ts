import {
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    Renderer2,
    Output,
    EventEmitter,
    AfterViewInit,
} from '@angular/core';
import {StringUtils} from '@algonomia/ts-shared';

interface CropTextMiddleExt {
    text: string;
    is_cropped: boolean;
}

@Directive({
    selector: '[appMiddleEllipsis]',
    standalone: true
})
export class MiddleEllipsisDirective implements AfterViewInit, OnDestroy {
    @Input() originalText: string = '';
    @Input() trailing: string = '...';
    @Output() isCropped = new EventEmitter<boolean>();

    private _resizeObserver!: ResizeObserver;
    private _measureCanvas: HTMLCanvasElement | null = null;

    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
    ) {}

    ngAfterViewInit(): void {
        this._resizeObserver = new ResizeObserver(() => {
            const is_cropped = this._applyEllipsis();
            this.isCropped.emit(is_cropped);
        });
        this._resizeObserver.observe(this._elementRef.nativeElement);
    }

    private _applyEllipsis(): boolean {
        const cropTextExt: CropTextMiddleExt = this._cropTextMiddleExt();
        this._renderer.setProperty(this._elementRef.nativeElement, 'innerText', cropTextExt.text);
        return cropTextExt.is_cropped;
    }

    private _cropTextMiddleExt(): CropTextMiddleExt {
        const croppedText: string = this._cropTextMiddle();
        return {
            text: croppedText,
            is_cropped: this.originalText !== croppedText
        };
    }

    private _cropTextMiddle(): string {
        const availableWidth = this._elementRef.nativeElement.offsetWidth;

        if (this._measureTextWidth(this.originalText) <= availableWidth) {
            return this.originalText;
        }

        let low: number = this.trailing.length;
        let high: number = this.originalText.length;
        let croppedText: string = this.originalText;

        while (low <= high) {
            const maxLength: number = Math.floor((low + high) / 2);
            const textSliced: string = StringUtils.sliceTextMiddle(this.originalText, maxLength, this.trailing);
            const textWidth: number = this._measureTextWidth(textSliced);

            if (textWidth <= availableWidth) {
                croppedText = textSliced;
                low = maxLength + 1;
            } else {
                high = maxLength - 1;
            }
        }

        return croppedText;
    }

    private _measureTextWidth(text: string): number {
        if (!this._measureCanvas) {
            this._measureCanvas = document.createElement('canvas');
        }

        const context: CanvasRenderingContext2D = this._measureCanvas.getContext('2d')!;
        const computedStyle: CSSStyleDeclaration = getComputedStyle(this._elementRef.nativeElement);

        context.font = computedStyle.font;
        context.letterSpacing = computedStyle.letterSpacing;

        return context.measureText(text).width;
    }

    ngOnDestroy(): void {
        this._resizeObserver?.disconnect();
        this._measureCanvas = null;
    }
}
