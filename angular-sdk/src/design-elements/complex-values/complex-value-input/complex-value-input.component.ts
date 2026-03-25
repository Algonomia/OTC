import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, computed, effect,
    EventEmitter, input,
    Output, signal,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {
    AlgoComplexValueValidator,
    EBaseTypes,
    TComplexValue, IScope,
    ITag, ObjectUtils
} from '@algonomia/ts-shared';
import {DisplayComplexValuePipe} from '../../../pipes/display-complex-value.pipe';
import {ButtonEditComponent} from '../../buttons/buttons/button-edit/button-edit.component';
import {TranslatePipe} from '@ngx-translate/core';
import {ModalService, ModalSize} from '../../../global-services/modal.service';
import {ComplexValueEditorComponent} from './complex-value-editor/complex-value-editor.component';
import {ButtonCancelComponent} from '../../buttons/buttons/button-cancel/button-cancel.component';
import {ButtonContinueComponent} from '../../buttons/buttons/button-continue/button-continue.component';
import {
    FormControlErrorsTooltipComponent
} from '../../form-controls/common/form-control-errors-tooltip/form-control-errors-tooltip.component';
import {AlgoIconComponent} from '../../algo-icon/algo-icon/algo-icon.component';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-complex-value-input',
    imports: [
        DisplayComplexValuePipe,
        ButtonEditComponent,
        TranslatePipe,
        ComplexValueEditorComponent,
        ButtonCancelComponent,
        ButtonContinueComponent,
        FormControlErrorsTooltipComponent,
        AlgoIconComponent,
        NgTemplateOutlet
    ],
  templateUrl: './complex-value-input.component.html',
  styleUrl: './complex-value-input.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplexValueInputComponent {
    @ViewChild('editorModal') editorModal!: TemplateRef<unknown>;
    @Output() complexValueChange = new EventEmitter<TComplexValue | null>();
    required = input<boolean | undefined>();
    TAG_LIST = input<ITag[]>([]);
    SCOPE_LIST = input<IScope[]>([]);
    complexValue = input<TComplexValue | null>(null);
    expected_type = input<EBaseTypes | null>(null);

    protected __errors = computed(() => {
        return this.getErrors(this.complexValue(), this.expected_type(), this.required());
    });
    protected __isValid = computed(() => {
        const errors = this.__errors();
        if (!!errors && JSON.stringify(errors) !== '{}') {
            return false;
        }
        return true;
    });

    private __modalComplexValue = signal<TComplexValue | null>(null);
    protected __modalComplexValueValid = computed(() => {
        const errors = this.getErrors(this.__modalComplexValue(), this.expected_type());
        if (!!errors && JSON.stringify(errors) !== '{}') {
            return false;
        }
        return true;
    });

    constructor(private _modalService: ModalService, private _cd: ChangeDetectorRef) {
        effect(() => {
            this.__modalComplexValue.set(this.complexValue());
            this._cd.markForCheck();
        });
    }

    private _modalSize: ModalSize = 'full';
    protected __height = 'calc(0.9 * var(--app-height))';
    open() {
        this._modalService.openTemplate(this.editorModal, undefined, this._modalSize, undefined, false);
    }

    closeModal() {
        this._modalService.close();
    }

    getErrors(complexValue: TComplexValue | null, expected_output: EBaseTypes | null, required = false) {
        try {
            const errors = new AlgoComplexValueValidator(
                {tag_list: this.TAG_LIST(), scope_list: this.SCOPE_LIST(), expected_output: expected_output, required: required}
            ).checkErrors(complexValue);
            return ObjectUtils.fuseObjects(...errors);
        } catch(_) {
            return null;
        }
    }

    protected __updateModalComplexValue(modalComplexValue: TComplexValue | null) {
        this.__modalComplexValue.set(modalComplexValue ? {...modalComplexValue} : null);
        this._cd.markForCheck();
    }

    protected __save() {
        this.complexValueChange.emit(this.__modalComplexValue());
        this._modalService.close();
        this._cd.markForCheck();
    }
}
