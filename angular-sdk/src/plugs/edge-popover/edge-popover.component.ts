import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Input,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Popover, PopoverModule} from 'primeng/popover';
import {debounceTime, Subject} from 'rxjs';
import {ATemplateWithResizablesComponent} from '../../templates/template-resize-observer-component.abstract';

@Component({
    selector: 'app-edge-popover',
    templateUrl: './edge-popover.component.html',
    styleUrl: './edge-popover.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        PopoverModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgePopoverComponent extends ATemplateWithResizablesComponent implements AfterViewInit {
    static notifyOpened$ = new Subject<EdgePopoverComponent>();
    @Input() contentTpl!: TemplateRef<any>;
    @Input() triggerIsOpenTpl!: TemplateRef<any>;
    @Input() styleClass: string = '';

    @Output() openClose = new EventEmitter();
    @ViewChild('popover') popover!: Popover;

    constructor(private _cd: ChangeDetectorRef) {
        super();
        this.pipeTakeUntil(EdgePopoverComponent.notifyOpened$).subscribe(x => {
            if (x === this) {
                return;
            }
            this.popover.hide();
        });
    }

    ngAfterViewInit() {
        this.resizeObservable().pipe(debounceTime(200)).subscribe(_ => {
            if (this.popover?.overlayVisible) {
                this.popover?.align?.();
            }
        });
    }

    public toggle(event: MouseEvent) {
        this.popover.toggle(event);
        this._cd.markForCheck();
        event.stopPropagation();
    }

    onShow() {
        this.openClose.next(true);
        EdgePopoverComponent.notifyOpened$.next(this);

        // Be carefully with library updates as this trick is not present in documentation
        setTimeout(() => {
            this.popover.align?.();
        }, 0);
    }

    hide() {
        this.popover.hide();
    }

    onHide() {
        this.openClose.next(false);
    }

    protected override __onDestroy() {
        this.popover.hide();
        super.__onDestroy();
    }
}
