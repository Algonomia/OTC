import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {SelectHandler, SelectionState} from '../../../handlers/select-handler/select-handler';
import {EdgePopoverComponent} from '../../../plugs/edge-popover/edge-popover.component';
import {LabelMenuComponent} from '../../labels/labels/label-menu/label-menu.component';
import {SelectDisplayValuePipe} from '../../../handlers/select-handler/pipes/display-value.pipe';
import {AsyncPipe} from '@angular/common';
import {ATemplateComponent} from '../../../templates/template-component.abstract';
import {BehaviorSubject, filter, Observable, ReplaySubject, switchMap, tap} from 'rxjs';
import {AlgoIconComponent} from '../../algo-icon/algo-icon/algo-icon.component';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {VirtualScrollHandlerComponent} from '../../../plugs/virtual-scroll-handler/virtual-scroll-handler.component';
import {TooltipModule} from 'primeng/tooltip';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {SelectAllCheckboxComponent} from '../../select-handlers/select-all-checkbox/select-all-checkbox.component';
import {SingleSelectBoxComponent} from '../../select-handlers/single-select-box/single-select-box.component';
import {TextCroppedComponent} from '../../text-cropping/text-cropped/text-cropped.component';
import {SelectedPipe} from '../../../handlers/select-handler/pipes/selected.pipe';
import {SelectedStatePipe} from '../../../handlers/select-handler/pipes/selected-state.pipe';
import {AGrouper} from '@algonomia/ts-shared';
import {AlgoTreeFactory, IAlgoNavSubTree, ITreeDisplayItem} from '../../../handlers/tree-factory';
import {SomeSelectedPipe} from '../../../handlers/select-handler/pipes/some-selected.pipe';
import {SearchFilterHandler} from '../../../handlers/search-filter-handler/search-filter-handler';
import {ToggleComponent} from '../../../global-components/toggle/toggle.component';
import {SelectedTextDelegate} from '../selected-text-delegate';

@Component({
    selector: 'app-std-menu',
    imports: [
        EdgePopoverComponent,
        LabelMenuComponent,
        SelectDisplayValuePipe,
        AsyncPipe,
        AlgoIconComponent,
        TranslatePipe,
        VirtualScrollHandlerComponent,
        TooltipModule,
        ReactiveFormsModule,
        SelectAllCheckboxComponent,
        SingleSelectBoxComponent,
        TextCroppedComponent,
        SelectedPipe,
        SelectedStatePipe,
        SomeSelectedPipe,
        ToggleComponent
    ],
    templateUrl: './std-menu.component.html',
    styleUrl: './std-menu.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StdMenuComponent<T, ID> extends ATemplateComponent implements OnInit {
    @ViewChild(EdgePopoverComponent) popoverComponent!: EdgePopoverComponent;
    @Input() set selectHandler(selectHandler: SelectHandler<T, ID>) {
        this.__selectHandler = selectHandler;
        this.__selectHandler$.next(selectHandler);
        this._cd.markForCheck();
    }
    @Input() placeholder = 'Menu';
    @Input() selectAll = true;
    @Input() sorted = true;
    @Input() segmenter?: AGrouper<T, string[], string[]>;
    @Input() triggerTpl?: TemplateRef<any>;
    @Input() labelSymbol: string = '';

    protected __selectHandler!: SelectHandler<T, ID>;
    protected __selectHandler$ = new ReplaySubject<SelectHandler<T, ID>>(1);
    protected __treeFactory = new AlgoTreeFactory<string, T>();

    __isOpen = false;
    __isOpen$ = new BehaviorSubject<boolean>(false);
    __searchControl = new FormControl('');
    __filteredList$!: Observable<T[]>;
    __flatTree!: Observable<ITreeDisplayItem<string, T>[]>;
    __text: string = '';
    __showOnlySelected$ = new BehaviorSubject<boolean>(false);

    protected readonly SelectionState = SelectionState;

    constructor(private _cd: ChangeDetectorRef, private _translate: TranslateService) {
        super();
    }

    changeOpen(isOpen: boolean) {
        this.__isOpen = isOpen;
        if (this.__isOpen) {
            this.__isOpen$.next(isOpen);
        }
        this._cd.markForCheck();
    }

    ngOnInit() {
        this.__searchControl = new FormControl('');

        this.__filteredList$ = SearchFilterHandler.filteredList$(
            this.__selectHandler$,
            this.__searchControl.valueChanges,
            this.sorted,
            this.__showOnlySelected$
        );

        let initOpenNodes = false;
        this.__flatTree = this.pipeTakeUntil(this.__isOpen$).pipe(
            filter(x => !!x),
            tap(_ => {
                initOpenNodes = true;
            }),
            switchMap(_ => this.__filteredList$),
            switchMap(list => {
                const segments = this.segmenter?.group(list) ?? [[[], list]];
                this.__treeFactory.branches = segments.map(([keys, leafs]) => ({branch: keys, leafs: leafs}));
                if (initOpenNodes) {
                    this.__treeFactory.forceOpenState(this.__selectHandler.selected);
                    initOpenNodes = false;
                }
                return this.__treeFactory.visibleBranches$;
            })
        );

        this.pipeTakeUntil(SelectedTextDelegate.selectedText$(
            this.__selectHandler$, this.placeholder, this._translate
        )).subscribe(text => {
            this.__text = text;
            this._cd.markForCheck();
        });
    }

    switch(value: T) {
        this.__selectHandler.switch(value);

        if (
            this.__selectHandler.isFakeSelectHandler
            || (this.__selectHandler.isSingleSelection && this.__selectHandler.selectedSize > 0)
        ) {
            this.popoverComponent.hide();
        }
    }

    openNode(node: IAlgoNavSubTree<string, T>) {
        this.__treeFactory.openCloseNode(node);
        this._cd.markForCheck();
    }

    public eraseSearchControl() {
        this.__searchControl.setValue('');
    }
}
