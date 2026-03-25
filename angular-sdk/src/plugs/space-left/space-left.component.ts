import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef, Input,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {ATemplateWithResizablesComponent} from '../../templates/template-resize-observer-component.abstract';
import {NgClass, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-space-left',
    imports: [
        NgTemplateOutlet,
        NgClass
    ],
  templateUrl: './space-left.component.html',
  styleUrl: './space-left.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SpaceLeftComponent extends ATemplateWithResizablesComponent implements AfterViewInit {
    @Input() firstTpl!: TemplateRef<any>;
    @Input() secondTpl!: TemplateRef<any>;
    @Input() minHeight: number = 0;
    @Input() wrapperClass: string = '';
    @ViewChild('first') first!: ElementRef<HTMLDivElement>;
    @ViewChild('second') second!: ElementRef<HTMLDivElement>;

    secondHeight = 0;

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        this.resizeObservable().subscribe(_ => {
            this.recalc();
        });
    }

    recalc() {
        const totalHeight = this.first.nativeElement.parentElement?.clientHeight ?? 0;
        const firstHeight = this.first.nativeElement.offsetHeight;
        this.secondHeight = Math.max(totalHeight - firstHeight, this.minHeight);
        this._cd.markForCheck();
    }
}
