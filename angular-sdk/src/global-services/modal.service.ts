import {
    ChangeDetectionStrategy,
    Component,
    Injectable, Input,
    TemplateRef,
    Type,
} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {Observable, of} from 'rxjs';
import {NgTemplateOutlet} from '@angular/common';

export type ModalSize = 'small-full-height' | 'small' | 'medium' | 'large' | 'full';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    private _refs: DynamicDialogRef[] = [];

    static readonly modal_width : { [key in ModalSize]: string } = {
        'small-full-height': 'calc(min(520px, calc(0.9 * var(--app-width))))',
        'small': 'calc(min(520px, calc(0.9 * var(--app-width))))',
        'medium': 'calc(min(740px, calc(0.9 * var(--app-width))))',
        'large': 'calc(0.9 * var(--app-width))',
        'full': 'calc(0.9 * var(--app-width))'
    };
    static readonly modal_height : { [key in ModalSize]: string } = {
        'small-full-height': '',
        'small': '',
        'medium': '',
        'large': '',
        'full': 'calc(0.9 * var(--app-height))'
    };
    static readonly modal_max_height : { [key in ModalSize]: string } = {
        'small-full-height': 'calc(0.9 * var(--app-height))',
        'small': 'calc(min(520px, calc(0.9 * var(--app-height))))',
        'medium': 'calc(0.9 * var(--app-height))',
        'large': 'calc(0.9 * var(--app-height))',
        'full': ''
    };

    constructor(private _dialogService: DialogService) {}

    openTemplate(template: TemplateRef<unknown>, context: any = {}, modalSize: ModalSize = 'small', header_title?: string, closable = true): Observable<undefined> {
        return this.open(TemplateDialogComponent, modalSize, {template: template, context: context}, header_title, closable);
    }

    open(
        component: Type<unknown>,
        modalSize: ModalSize = 'small',
        inputs: any = {},
        header_title?: string,
        closable = true
    ): Observable<undefined> {
        const options: DynamicDialogConfig = {
            dismissableMask: closable,
            closable: closable,
            closeOnEscape: closable,
            header: header_title,
            showHeader: !!header_title,
            width: ModalService.modal_width[modalSize],
            modal: true,
            styleClass: 'algo-dialog',
            inputValues: inputs,
            style: {
                'height': ModalService.modal_height[modalSize],
                'max-height': ModalService.modal_max_height[modalSize],
            }
        };

        const ref = this._dialogService.open(component, options);
        if (!ref) {
            return of(undefined);
        }
        this._refs.push(ref);

        ref.onClose.subscribe(() => {
            this._refs = this._refs.filter(r => r !== ref);
        });

        return ref.onClose;
    }

    close() {
        const lastRef = this._refs.pop();
        lastRef?.close();
    }

    closeWithResult(result: any) {
        const lastRef = this._refs.pop();
        lastRef?.close(result);
    }
}

@Component({
    selector: 'app-template-dialog',
    imports: [NgTemplateOutlet],
    standalone: true,
    template: `<div style="width: 100%; height: 100%"><ng-container *ngTemplateOutlet="template; context: context"></ng-container></div>`,
    styles: [`
        ::ng-deep app-template-dialog {
            width: 100%;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TemplateDialogComponent {
    @Input() template!: TemplateRef<any>;
    @Input() context?: any;

    constructor() {}
}
