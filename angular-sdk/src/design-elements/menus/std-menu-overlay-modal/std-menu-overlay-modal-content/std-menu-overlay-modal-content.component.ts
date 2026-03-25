import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {SelectHandler, SelectionState} from '../../../../handlers/select-handler/select-handler';
import {SelectDisplayValuePipe} from '../../../../handlers/select-handler/pipes/display-value.pipe';
import {AsyncPipe} from '@angular/common';
import {ATemplateComponent} from '../../../../templates/template-component.abstract';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {AlgoIconComponent} from '../../../algo-icon/algo-icon/algo-icon.component';
import {TranslatePipe} from '@ngx-translate/core';
import {VirtualScrollHandlerComponent} from '../../../../plugs/virtual-scroll-handler/virtual-scroll-handler.component';
import {TooltipModule} from 'primeng/tooltip';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {SelectAllCheckboxComponent} from '../../../select-handlers/select-all-checkbox/select-all-checkbox.component';
import {SingleSelectBoxComponent} from '../../../select-handlers/single-select-box/single-select-box.component';
import {SelectedPipe} from '../../../../handlers/select-handler/pipes/selected.pipe';
import {SelectedStatePipe} from '../../../../handlers/select-handler/pipes/selected-state.pipe';
import {ModalService, ModalSize} from '../../../../global-services/modal.service';
import {TextCroppedTooltipComponent} from '../../../text-cropping/text-cropped-tooltip/text-cropped-tooltip.component';
import {ToggleComponent} from '../../../../global-components/toggle/toggle.component';
import {SearchFilterHandler} from '../../../../handlers/search-filter-handler/search-filter-handler';

@Component({
    selector: 'app-std-menu-overlay-modal-content',
    imports: [
        SelectDisplayValuePipe,
        AsyncPipe,
        AlgoIconComponent,
        TranslatePipe,
        VirtualScrollHandlerComponent,
        TooltipModule,
        ReactiveFormsModule,
        SelectAllCheckboxComponent,
        SingleSelectBoxComponent,
        SelectedPipe,
        SelectedStatePipe,
        TextCroppedTooltipComponent,
        ToggleComponent,
    ],
    templateUrl: './std-menu-overlay-modal-content.component.html',
    styleUrl: './std-menu-overlay-modal-content.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StdMenuOverlayModalContentComponent<T, ID> extends ATemplateComponent implements OnInit {
    @Input() selectHandler!: SelectHandler<T, ID>;
    @Input() selectAll!: boolean;
    @Input() sorted!: boolean;
    @Input() sizeModal!: ModalSize;

    protected __searchControl = new FormControl('');
    protected __filteredList$!: Observable<T[]>;
    protected __showOnlySelected$ = new BehaviorSubject<boolean>(false);

    public modal_width: string = '';
    public virtual_scroll_max_height: string = '';
    public line_height: number = 46;

    protected readonly SelectionState = SelectionState;

    constructor(private _cd: ChangeDetectorRef,) {
        super();
    }

    ngOnInit() {
        this.modal_width = ModalService.modal_width[this.sizeModal];
        let heightBeing = 158; // 158px being size of header + searchbar + toggle

        if (!this.selectHandler.isSingleSelection && this.selectAll) {
            heightBeing += this.line_height; // height of ligne Select All
        }
        this.virtual_scroll_max_height = `calc(${ModalService.modal_max_height[this.sizeModal]} - ${heightBeing}px)`;

        if (!this.selectHandler) {
            return;
        }

        this.__filteredList$ = SearchFilterHandler.filteredList$(
            of(this.selectHandler),
            this.__searchControl.valueChanges,
            this.sorted,
            this.__showOnlySelected$
        );

        this._cd.markForCheck();
    }

    public eraseSearchControl() {
        this.__searchControl.setValue('');
    }
}
