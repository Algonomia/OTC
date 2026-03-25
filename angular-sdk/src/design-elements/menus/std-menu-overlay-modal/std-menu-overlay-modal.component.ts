import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SelectHandler} from '../../../handlers/select-handler/select-handler';
import {LabelMenuComponent} from '../../labels/labels/label-menu/label-menu.component';
import {ATemplateComponent} from '../../../templates/template-component.abstract';
import {ReplaySubject} from 'rxjs';
import {ModalService, ModalSize} from '../../../global-services/modal.service';
import {StdMenuOverlayModalContentComponent} from './std-menu-overlay-modal-content/std-menu-overlay-modal-content.component';
import {SelectedTextDelegate} from '../selected-text-delegate';

@Component({
    selector: 'app-std-menu-overlay-modal',
    imports: [
        LabelMenuComponent,
    ],
    templateUrl: './std-menu-overlay-modal.component.html',
    styleUrl: './std-menu-overlay-modal.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StdMenuOverlayModalComponent<T, ID> extends ATemplateComponent implements OnInit {
    @Input() set selectHandler(selectHandler: SelectHandler<T, ID>) {
        this.__selectHandler = selectHandler;
        this.__selectHandler$.next(selectHandler);
        this._cd.markForCheck();
    }
    @Input() placeholder: string = 'Menu';
    @Input() modalTitle: string = '';
    @Input() selectAll: boolean = true;
    @Input() sorted: boolean = true;

    protected __selectHandler!: SelectHandler<T, ID>;
    protected __selectHandler$ = new ReplaySubject<SelectHandler<T, ID>>(1);

    __isOpen = false;
    __text: string = '';

    public size_modal: ModalSize = 'medium';

    constructor(
        private _cd: ChangeDetectorRef,
        private _modalService: ModalService,
        private _translate: TranslateService
    ) {
        super();
    }

    openModal() {
        this.__isOpen = true;
        this._cd.markForCheck();

        const inputs = {
            selectHandler: this.__selectHandler,
            selectAll: this.selectAll,
            sorted: this.sorted,
            sizeModal: this.size_modal
        };

        this.pipeTakeUntil(
            this._modalService.open(StdMenuOverlayModalContentComponent, this.size_modal, inputs, this.modalTitle)
        ).subscribe(() => {
            this.__isOpen = false;
            this._cd.markForCheck();
        });
    }

    ngOnInit() {
        this.pipeTakeUntil(SelectedTextDelegate.selectedText$(
            this.__selectHandler$,
            this.placeholder,
            this._translate
        )).subscribe(text => {
            this.__text = text;
            this._cd.markForCheck();
        });
    }
}
