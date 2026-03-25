import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    Input,
    OnDestroy,
    QueryList,
    TemplateRef, ViewChild,
    ViewChildren
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ATemplateWithResizablesComponent} from '../../templates/template-resize-observer-component.abstract';

@Component({
    selector: 'app-list-items-handler',
    templateUrl: './list-items-handler.component.html',
    styleUrls: ['./list-items-handler.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListItemsHandlerComponent<T> extends ATemplateWithResizablesComponent implements AfterViewInit, OnDestroy {
    @ContentChild('dataContent') dataContent!: TemplateRef<any>;
    @ContentChild('counterTemplate') counterTemplate!: TemplateRef<any>;
    @ViewChild('parent') parent!: ElementRef;
    @ViewChild('dataContainer') dataContainer!: ElementRef;
    @ViewChildren('dataRef') dataElemRefs!: QueryList<ElementRef>;
    @Input() set list(orderedList: T[]) {
        this.__full_list = [...(orderedList ?? [])];
        this._cd.markForCheck();
    }

    protected __list: T[] = [];
    protected __full_list: T[] = [];
    protected __list_to_show: T[] = [];

    public hidden_items = 0;

    constructor(private _cd: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit(): void {
        this.pipeTakeUntil(this.resizeObservable()).subscribe(() => {
            this._calculateVisibleItems();
        });
    }

    private _calculateVisibleItems() {
        this.__list = [];

        for (let i = 0; i < this.__full_list.length; i++) {
            const dataElemRefHeight = this.dataElemRefs.get(0)?.nativeElement.offsetHeight;

            if (i === 0 || (this.dataContainer.nativeElement.scrollHeight + dataElemRefHeight) < this.parent.nativeElement.offsetHeight) {
                this.__list.push(this.__full_list[i]);
                this._cd.detectChanges();
            }
        }

        this.__list_to_show = [...this.__list];
        this.hidden_items = this.__full_list.length - this.__list_to_show.length;
        this._cd.markForCheck();
    }
}
